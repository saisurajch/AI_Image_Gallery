"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Moon, Sun, Upload, Library, Download, Paperclip, RefreshCcw, Pencil, FolderX, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { CheckCircleIcon, SpinnerIcon, AlbumsIcon, FavouritesIcon, TrashIcon, RemoveFavouritesIcon,EmptyPhotosIcon, EmptyAlbumIcon, EmptyFavouritesIcon, EmptyTrashIcon } from "@/components/icons";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Dialog2, DialogContent2, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog2";
import { Dialog3, DialogContent3} from "@/components/ui/dialog3";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { FileUploader, FileUploaderContent, FileUploaderItem, FileInput } from "@/components/ui/extension/file-upload";
import { cn } from "@/lib/utils";
import JSZip, { forEach } from "jszip";
import { saveAs } from "file-saver";
import {Select,SelectContent,SelectGroup,SelectItem,SelectLabel,SelectTrigger,SelectValue} from "@/components/ui/select"
import { getCookie } from "cookies-next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';
import { ToastAction } from "@/components/ui/toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from "@/components/ui/separator"
import { BlurFade } from "@/components/magicui/blur-fade";

interface Photo {
  image_id: string;
  favourite: boolean;
  src: string;
  alt: string;
}

interface Section {
  date: string;
  subDates: {
    subDate: string;
    photos: Photo[];
  }[];
}

interface PhotoGalleryProps {
  selectedImages: string[];
  setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>;
  photoData: Section[];
}

interface AlbumResponse {
  album: {
    album_id: string;
    email: string;
    image_ids: string[];
    album_name: string;
  };
  images: {
    deleted: boolean;
    context: string;
    upload_time: string;
    favourite: boolean;
    image_id: string;
    albums: string[];
    email: string;
    s3_url: string;
    signed_url: string;
  }[];
}

type ViewType = 'photos' | 'albums' | 'favorites' | 'trash';
const rows = 6; // Number of rows
const columns = 6; // Number of columns per row
export default function Page() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[] | null>(null);
  const [photoData, setPhotoData] = useState<Section[]>([]);
  const [isAddToAlbumDialogOpen, setIsAddToAlbumDialogOpen] = useState(false);
  const [albums, setAlbums] = React.useState<any[]>([]);
  const [userInfo, setUserInfo] = React.useState<{
    name: string;
    email: string;
    token: string | null;
  }>({
    name: "Guest",
    email: "guest@example.com",
    token: null,
  });
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [isAddingToAlbum, setIsAddingToAlbum] = useState(false);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [favoritePhotos, setFavoritePhotos] = useState<Section[]>([]);
  const [trashPhotos, setTrashPhotos] = useState<Photo[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('photos');
  const [query, setQuery] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isRemoveFromAlbumAlertOpen, setIsRemoveFromAlbumAlertOpen] = useState(false);
  const [isRecoverAlertOpen, setIsRecoverAlertOpen] = useState(false);
  const [isDeletingImages, setIsDeletingImages] = useState(false);
  const [isRemovingFromAlbum, setIsRemovingFromAlbum] = useState(false);
  const [isRecoveringImages, setIsRecoveringImages] = useState(false);
  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false);
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [isFetchingAlbumPhotos, setIsFetchingAlbumPhotos] = useState(false);
  const [isFetchingFavorites, setIsFetchingFavorites] = useState(false);
  const [isFetchingTrash, setIsFetchingTrash] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDeleteImagesClick = () => {
    setIsDeleteAlertOpen(true);
  };

  const handleRemoveFromAlbumClick = () => {
    setIsRemoveFromAlbumAlertOpen(true);
  };

  const handleRecoverImagesClick = () => {
    setIsRecoverAlertOpen(true);
  };

  const fetchImages = async () => {
    setIsFetchingImages(true);
    try {
      const idToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("id_token="))
        ?.split("=")[1];
  
        if (!idToken) {
          toast({
            title: "Error",
            description: `No Authorization token found`,
            variant: "destructive",
            action: (
              <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
            ),
          });
          return;
        }
  
      const url = (query.length > 0)
        ? `https://bottleneckapi.saisurajch.me/images/getphotos?query=${encodeURIComponent(query)}`
        : "https://bottleneckapi.saisurajch.me/images/getphotos";
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }
  
      const data = await response.json();
      setPhotoData(transformApiResponse(data, "photos_by_date"));
      setSelectedImages([]); // Reset selected images
      setIsFetchingImages(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
      setIsFetchingImages(false);
    }
  };

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
      return {};
    }
  };
   
  // ✅ Decodes JWT from cookies
  const decodeToken = () => {
    const idToken = getCookie("id_token");
    if (!idToken || typeof idToken !== "string")
      return {
        name: "Guest",
        email: "guest@example.com",
        token: null,
      };
  
    try {
      const decoded = parseJwt(idToken);
      return {
        name: decoded.name || "User",
        email: decoded.email || "unknown@example.com",
        token: idToken,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
      return {
        name: "User",
        email: "unknown@example.com",
        token: null,
      };
    }
  };


  const fetchUserInfoAndAlbums = async () => {
    const user = decodeToken();
    setUserInfo(user);

    if (!user.token) {
      toast({
        title: "Error",
        description: `No Authorization token found`,
        variant: "destructive",
        action: (
          <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
        ),
      });
      return;
    }

    try {
      const response = await fetch(
        "https://bottleneckapi.saisurajch.me/albums/getalbums",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`, // Pass token as Bearer
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch albums: ${response.statusText}`);
      }

      const albumData = await response.json();
      const userAlbums = albumData.filter(
        (album: any) => album.email === user.email
      );
      setAlbums(userAlbums);
      setSelectedImages([]); // Reset selected images
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {




    fetchUserInfoAndAlbums();



    fetchImages();
    setMounted(true);
  }, []);

  function transformApiResponse(
    apiResponse: {
      favourites_by_date: { [date: string]: { signed_url?: string; image_id: string; favourite: boolean }[] };
      photos_by_date: { [date: string]: { signed_url?: string; image_id: string; favourite: boolean }[] };
    },
    view: string
  ) {
    const groupedPhotos: Record<
      string,
      { subDate: string; photos: { image_id: string; favourite: boolean; src: string; alt: string }[] }[]
    > = {};
    
    let apidata = view === "photos_by_date" ? apiResponse.photos_by_date : apiResponse.favourites_by_date;
  
    Object.entries(apidata).forEach(([date, photos]) => {
      const monthYear = new Date(date).toLocaleString("en-US", { month: "long", year: "numeric" });
      const subDate = new Date(date).toDateString();
  
      if (!groupedPhotos[monthYear]) {
        groupedPhotos[monthYear] = [];
      }
  
      groupedPhotos[monthYear].push({
        subDate,
        photos: photos.map((photo) => ({
          image_id: photo.image_id,
          favourite: photo.favourite,
          src: photo.signed_url || `https://your-s3-bucket-url/${photo.image_id}`,
          alt: `Photo ${photo.image_id}`,
        })),
      });
    });
  
    return Object.entries(groupedPhotos)
      .map(([monthYear, subDates]) => ({
        date: monthYear,
        subDates: subDates.sort(
          (a, b) => new Date(b.subDate).getTime() - new Date(a.subDate).getTime()
        ), // Sort dates within the month in descending order
      }))
      .sort(
        (a, b) => new Date(b.subDates[0].subDate).getTime() - new Date(a.subDates[0].subDate).getTime()
      ); // Sort months in descending order based on the latest date
  }
  

  const areAllSelectedImagesFavorites = () => {
    if (selectedImages.length === 0) return false;
    
    return selectedImages.every((imageId) => {
      for (const section of photoData) {
        for (const subDate of section.subDates) {
          const photo = subDate.photos.find(p => p.image_id === imageId);
          if (photo) {
            return photo.favourite;
          }
        }
      }
      return false;
    });
  };

  const fetchAlbumPhotos = async (albumId: string) => {
    setIsFetchingAlbumPhotos(true);
    try {
      const idToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("id_token="))
        ?.split("=")[1];

        if (!idToken) {
          toast({
            title: "Error",
            description: `No Authorization token found`,
            variant: "destructive",
            action: (
              <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
            ),
          });
          return;
        }

      const response = await fetch(
        `https://bottleneckapi.saisurajch.me/albums/getalbums?album_id=${albumId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch album photos");
      }

      const data: AlbumResponse = await response.json();
      
      const transformedPhotos = data.images.map(img => ({
        image_id: img.image_id,
        favourite: img.favourite,
        src: img.signed_url,
        alt: `Photo ${img.image_id}`
      }));

      setAlbumPhotos(transformedPhotos);
      setCurrentAlbumId(albumId);
      setCurrentView('albums');
      setSelectedImages([]); // Reset selected images when switching views
      setIsFetchingAlbumPhotos(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
      setIsFetchingAlbumPhotos(false);
    }
  };

  const fetchFavorites = async () => {
    setIsFetchingFavorites(true);
    try {
      const idToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("id_token="))
        ?.split("=")[1];

        if (!idToken) {
          toast({
            title: "Error",
            description: `No Authorization token found`,
            variant: "destructive",
            action: (
              <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
            ),
          });
          return;
        }

      const response = await fetch(
        "https://bottleneckapi.saisurajch.me/images/getfavourites",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }

      const data = await response.json();


      setFavoritePhotos(transformApiResponse(data, "favourites_by_date"));
      setCurrentView('favorites');
      setCurrentAlbumId(null);
      setSelectedImages([]); // Reset selected images
      setIsFetchingFavorites(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
      setIsFetchingFavorites(false);
    }
  };

  const fetchTrash = async () => {
    setIsFetchingTrash(true);
    try {
      const idToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("id_token="))
        ?.split("=")[1];

        if (!idToken) {
          toast({
            title: "Error",
            description: `No Authorization token found`,
            variant: "destructive",
            action: (
              <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
            ),
          });
          return;
        }

      const response = await fetch(
        "https://bottleneckapi.saisurajch.me/images/gettrash",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trash");
      }

      const data = await response.json();
      const transformedPhotos = data.map((img: any) => ({
        image_id: img.image_id,
        favourite: img.favourite,
        src: img.signed_url,
        alt: `Photo ${img.image_id}`
      }));

      setTrashPhotos(transformedPhotos);
      setCurrentView('trash');
      setCurrentAlbumId(null);
      setSelectedImages([]); // Reset selected images
      setIsFetchingTrash(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
      setIsFetchingTrash(false);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setSelectedImages([]); // Reset selected images 
    setCurrentView(view);
    if (view === 'photos') {
      setQuery(''); // Reset search query
      fetchImages(); // Fetch all photos
    }
    
  };

  const sidebarProps = {
    userInfo,
    albums,
    onAlbumClick: fetchAlbumPhotos,
    onFavoritesClick: fetchFavorites,
    onTrashClick: fetchTrash,
    setCurrentView: handleViewChange, // Use the new handler
    setCurrentAlbumId
  };

  function AlbumGallery({ selectedImages, setSelectedImages, photos }: { 
    selectedImages: string[],
    setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>,
    photos: Photo[]
  }) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    
    const toggleSelect = (imageId: string) => {
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(imageId)) {
          newSet.delete(imageId);
        } else {
          newSet.add(imageId);
        }
        return Array.from(newSet);
      });
    };

    return (
      <div className="grid auto-rows-[200px] grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
        {photos.map((photo) => {
          const isSelected = selectedImages.includes(photo.image_id);
          return (
            <div
              key={photo.image_id}
              className={cn(
                "relative cursor-pointer group transition-transform duration-500 ease-in-out",
                isSelected ? "bg-blue-200 scale-90" : "bg-transparent"
              )}
              onClick={() => setSelectedPhoto(photo)}
            >
              <div
                className={cn(
                  "p-0 transition-transform duration-500 ease-in-out h-full",
                  isSelected ? "bg-blue-200 scale-90" : "bg-transparent"
                )}
              >
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.alt}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  unoptimized
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />

              <CheckCircleIcon
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(photo.image_id);
                }}
                className={cn(
                  "absolute top-2 left-2 w-6 h-6 transition-transform cursor-pointer",
                  isSelected
                    ? "text-blue-500 scale-100"
                    : "text-white opacity-0 group-hover:opacity-100 group-hover:scale-110"
                )}
              />
            </div>
          );
        })}

        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="flex items-center justify-center w-full h-full p-0 overflow-hidden bg-transparent">
            {selectedPhoto && (
              <div className="relative VmkiKe" style={{ width: "80vw", height: "80vh" }}>
                <Image
                  src={selectedPhoto.src || "/placeholder.svg"}
                  alt={selectedPhoto.alt}
                  fill
                  className="object-contain BiCYpc"
                  sizes="95vw"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  function PhotoGallery({ selectedImages, setSelectedImages, photoData }: PhotoGalleryProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
    const toggleSelect = (imageId: string) => {
      setSelectedImages((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(imageId)) {
          newSet.delete(imageId);
        } else {
          newSet.add(imageId);
        }
        return Array.from(newSet);
      });
    };
  
    return (
      <div className="space-y-8">
        {photoData.map((section) => (
          <div key={section.date} className="space-y-2">
            <h2 className={cn("text-2xl font-medium", "text-primary")}>{section.date}</h2>
  
            {section.subDates.map((subDateGroup) => (
              <div key={subDateGroup.subDate} className="space-y-2">
                <p className="text-sm text-muted-foreground">{subDateGroup.subDate}</p>
  
                <div className="grid auto-rows-[200px] grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
                  {subDateGroup.photos.map((photo) => {
                    const isSelected = selectedImages.includes(photo.image_id);
                    return (
                      <div
                        key={photo.image_id}
                        className={cn(
                          "relative cursor-pointer group transition-transform duration-500 ease-in-out",
                          isSelected ? "bg-blue-200 scale-90" : "bg-transparent"
                        )}
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div
                          className={cn(
                            "p-0 transition-transform duration-500 ease-in-out h-full",
                            isSelected ? "bg-blue-200 scale-90" : "bg-transparent"
                          )}
                        >
                          <Image
                            src={photo.src || "/placeholder.svg"}
                            alt={photo.alt}
                            width={1920}
                            height={1080}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                            unoptimized
                            loading="lazy"
                            
                          />
                        </div>
  
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
  
                        <CheckCircleIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(photo.image_id);
                          }}
                          className={cn(
                            "absolute top-2 left-2 w-6 h-6 transition-transform cursor-pointer",
                            isSelected
                              ? "text-blue-500 scale-100"
                              : "text-white opacity-0 group-hover:opacity-100 group-hover:scale-110"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
  
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="flex items-center justify-center w-full h-full p-0 overflow-hidden bg-transparent">
            {selectedPhoto && (
              <div className="relative VmkiKe" style={{ width: "80vw", height: "80vh" }}>
                <Image
                  src={selectedPhoto.src || "/placeholder.svg"}
                  alt={selectedPhoto.alt}
                  fill
                  className="object-contain BiCYpc"
                  sizes="95vw"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }


  const dropZoneConfig = {
    accept: {
      "image/png": [".jpg", ".jpeg", ".png"],
    },
    maxFiles: 25,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  const FileSvgDraw = () => {
    return (
      <>
        <Upload className="h-8 w-8 mt-4 mb-4 opacity-50"/>
        <p className="mb-1 text-sm text-bg opacity-50">
          <span className="font-semibold">Click to upload</span>
          &nbsp; or drag and drop
        </p>
        <p className="text-sm text-bg opacity-50">
          any Images
        </p>
      </>
    );
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const placeholders = ["Search your photos with keywords"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input value changed:", e.target.value);
    setQuery(e.target.value); // Always update query, even if it's empty
  };
  
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Submitting form...");
    await fetchImages();
    setQuery("");
  };

  const createAlbum = async (albumName: string) => {
    if (!albumName) return alert("Album name is required");
    
    setIsCreating(true);
    try {
      const idToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("id_token="))
        ?.split("=")[1];
  
      const response = await fetch("https://bottleneckapi.saisurajch.me/albums/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: {
            album_name: albumName,
          },
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create album");
      }
  
      setIsAlbumDialogOpen(false);
      setAlbumName("");
      toast({
        title: "Success",
        description: "Created album successfully",
      });
      fetchUserInfoAndAlbums();
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const uploadImages = async (files: File[] | null) => {
    if (!files || files.length === 0) return alert("No images selected.");
  
    const idToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("id_token="))
      ?.split("=")[1];
  
      if (!idToken) {
        toast({
          title: "Error",
          description: `No Authorization token found`,
          variant: "destructive",
          action: (
            <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
          ),
        });
        return;
      }
  
    setIsUploading(true);
  
    try {
      const base64Images = await Promise.all(
        files.map((file) => convertToBase64(file))
      );
  
      const response = await fetch("https://bottleneckapi.saisurajch.me/images/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          body: {
            images: base64Images,
          },
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload images");
      }
  
      setIsUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
      if (currentView === 'photos') {
        fetchImages(); // Refresh the images after upload
      }
      setFiles([]);
      } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const deleteImages = async (imageIds: string[]) => {
    if (imageIds.length === 0) return alert("No images selected.");

    const idToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("id_token="))
      ?.split("=")[1];

      if (!idToken) {
        toast({
          title: "Error",
          description: `No Authorization token found`,
          variant: "destructive",
          action: (
            <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
          ),
        });
        return;
      }
    setIsDeletingImages(true);
    try {
      const response = await fetch("https://bottleneckapi.saisurajch.me/images/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          body: {
            image_ids: imageIds,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete images");
      }

      setIsDeleteAlertOpen(false);
      toast({
        title: "Success",
        description: "Images have been moved to trash",
      });

      if (currentView === 'photos') {
        fetchImages(); // Refresh the images after deletion
      } else if (currentView === 'favorites') {
        fetchFavorites(); // Refresh the favorites after deletion
      } else if (currentView === 'albums') {
        fetchAlbumPhotos(currentAlbumId!);
      }
      setSelectedImages([]);

    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete images: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeletingImages(false);
    }

  };

  const addToFavourites = async (imageIds: string[]) => {
    if (imageIds.length === 0) return alert("No images selected.");
    const idToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("id_token="))
      ?.split("=")[1];
      if (!idToken) {
        toast({
          title: "Error",
          description: `No Authorization token found`,
          variant: "destructive",
          action: (
            <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
          ),
        });
        return;
      }
    try {
      const response = await fetch("https://bottleneckapi.saisurajch.me/images/addtofavourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          body: {
            image_ids: imageIds,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to favourites");
      }

      toast({
        title: "Success",
        description: "Added to favourites successfully",
      });
      
      setSelectedImages([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const removeFromFavourites = async (imageIds: string[]) => {
    if (imageIds.length === 0) return alert("No images selected.");
    const idToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("id_token="))
      ?.split("=")[1];
      if (!idToken) {
        toast({
          title: "Error",
          description: `No Authorization token found`,
          variant: "destructive",
          action: (
            <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
          ),
        });
        return;
      }
    try {
      const response = await fetch("https://bottleneckapi.saisurajch.me/images/removefromfavourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
 
            image_ids: imageIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove from favourites");
      }

      toast({
        title: "Success",
        description: "Images removed from from favourites successfully",
      });
      if (currentView === 'favorites') {
        fetchFavorites(); // Refresh the favorites after removal
      } else if (currentView === 'albums') {
        fetchAlbumPhotos(currentAlbumId!);
      } else if (currentView === 'photos') {
        fetchImages(); // Refresh the images after removal
      }
      setSelectedImages([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const downloadImages = async (imageIds: string[]) => {
    if (imageIds.length === 0) return alert("No images selected.");
  
    try {
      if (imageIds.length === 1) {
        // **Single image download**
        const imageId = imageIds[0];
        let imageUrl: string | undefined;
        let fileName: string | undefined;
  
        for (const section of photoData) {
          for (const subDate of section.subDates) {
            const photo = subDate.photos.find((p) => p.image_id === imageId);
            if (photo) {
              imageUrl = photo.src;
              fileName = `photo-${imageId}.jpg`;
              break;
            }
          }
          if (imageUrl) break;
        }
  
        if (!imageUrl) throw new Error(`Image URL not found for ID: ${imageId}`);
  
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to download image: ${imageId}`);
  
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName || "photo.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      } else {
        // **Multiple images → ZIP file**
        const zip = new JSZip();
  
        await Promise.all(
          imageIds.map(async (imageId) => {
            let imageUrl: string | undefined;
            let fileName: string | undefined;
  
            for (const section of photoData) {
              for (const subDate of section.subDates) {
                const photo = subDate.photos.find((p) => p.image_id === imageId);
                if (photo) {
                  imageUrl = photo.src;
                  fileName = `photo-${imageId}.jpg`;
                  break;
                }
              }
              if (imageUrl) break;
            }
  
            if (!imageUrl) return;
  
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${imageId}`);
  
            const blob = await response.blob();
            zip.file(fileName || `photo-${imageId}.jpg`, blob);
          })
        );
  
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "photos.zip");
      }
      toast({
        title: "Success",
        description: "Images downloaded successfully",
      });
      // **Clear selection after successful download**
      setSelectedImages([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const addToAlbum = async (imageIds: string[], albumid: string) => {
    if (imageIds.length === 0) return alert("No images selected.");

    const idToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("id_token="))
      ?.split("=")[1];

      if (!idToken) {
        toast({
          title: "Error",
          description: `No Authorization token found`,
          variant: "destructive",
          action: (
            <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
          ),
        });
        return;
      }
    setIsAddingToAlbum(true);
    try {
      const response = await fetch("https://bottleneckapi.saisurajch.me/albums/addimages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          body: {
            image_ids: imageIds,
            album_id: albumid,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to album");
      }


      setIsAddingToAlbum(false);
      setIsAddToAlbumDialogOpen(false);
      toast({
        title: "Success",
        description: "Images added to album successfully",
      });
      setSelectedImages([]);
    } catch (error) {
      setIsAddingToAlbum(false);
      setIsAddToAlbumDialogOpen(false);

      toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  
  const removeFromAlbum = async (imageIds: string[], albumId: string) => {
    if (imageIds.length === 0) return alert("No images selected.");

    const idToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("id_token="))
      ?.split("=")[1];

      if (!idToken) {
        toast({
          title: "Error",
          description: `No Authorization token found`,
          variant: "destructive",
          action: (
            <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
          ),
        });
        return;
      }
    setIsRemovingFromAlbum(true);
    try {
      const response = await fetch("https://bottleneckapi.saisurajch.me/albums/removeimages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          album_id: albumId,
          image_ids: imageIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove images from album");
      }

      setIsRemoveFromAlbumAlertOpen(false);
      toast({
        title: "Success",
        description: "Images removed from album successfully",
      });
      if (currentView === 'albums') {
        fetchAlbumPhotos(albumId); // Refresh the album photos after removal
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to remove images: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsRemovingFromAlbum(false);
    }
  };

  const recoverImages = async (imageIds: string[]) => {
    if (imageIds.length === 0) return alert("No images selected.");

    const idToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("id_token="))
      ?.split("=")[1];

      if (!idToken) {
        toast({
          title: "Error",
          description: `No Authorization token found`,
          variant: "destructive",
          action: (
            <ToastAction altText='Go to Login' onClick={() => router.push('/login')}>Login</ToastAction>
          ),
        });
        return;
      }
    setIsRecoveringImages(true);
    try {
      const response = await fetch("https://bottleneckapi.saisurajch.me/images/recover", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            image_ids: imageIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to recover images");
      }

      setIsRecoverAlertOpen(false);
      toast({
        title: "Success",
        description: "Images recovered successfully",
      });
      if (currentView === 'trash') {
        fetchTrash(); // Refresh the trash after recovery
      }

      setSelectedImages([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to recover images: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsRecoveringImages(false);
    }
  };

  const renderBreadcrumbs = () => {
    let breadcrumbs;
    
    switch (currentView) {
      case 'photos':
        breadcrumbs = (
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Photos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        );
        break;
      case 'albums':
        const currentAlbum = albums.find(album => album.album_id === currentAlbumId);
        breadcrumbs = (
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => handleViewChange('albums')}>Albums</BreadcrumbLink>
            </BreadcrumbItem>
            {currentAlbum && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>    {currentAlbum.album_name.length > 15
      ? `${currentAlbum.album_name.slice(0, 6)}...${currentAlbum.album_name.slice(-2)}`
      : currentAlbum.album_name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        );
        break;
      case 'favorites':
        breadcrumbs = (
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Favorites</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        );
        break;
      case 'trash':
        breadcrumbs = (
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Trash</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        );
        break;
      default:
        breadcrumbs = null;
    }

    return (
      <Breadcrumb className="mb-4">
        {breadcrumbs}
      </Breadcrumb>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar {...sidebarProps} onAlbumUpdate={() => fetchUserInfoAndAlbums()} currentView={currentView} currentAlbumId={currentAlbumId}/>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Your images will be deleted. However, you can recover them from trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsDeleteAlertOpen(false);
                deleteImages(selectedImages);
              }}
              disabled={isDeletingImages}
            >
              {isDeletingImages && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
              {isDeletingImages ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={isRemoveFromAlbumAlertOpen} 
        onOpenChange={setIsRemoveFromAlbumAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from album?</AlertDialogTitle>
            <AlertDialogDescription>
              Selected images will be removed from this album. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsRemoveFromAlbumAlertOpen(false);
                if (currentAlbumId) {
                  removeFromAlbum(selectedImages, currentAlbumId);
                }
              }}
              disabled={isRemovingFromAlbum}
            >
                {isRemovingFromAlbum && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
                {isRemovingFromAlbum ? "Removing..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRecoverAlertOpen} onOpenChange={setIsRecoverAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recover images?</AlertDialogTitle>
            <AlertDialogDescription>
              These images will be restored to your gallery and won't exist in trash anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsRecoverAlertOpen(false);
                recoverImages(selectedImages);
              }}
              disabled={isRecoveringImages}
            >
                {isRecoveringImages && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
                {isRecoveringImages ? "Recovering..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="mr-1 h-4" />
            <div className="mr-4 h-5 flex-none" >
            {renderBreadcrumbs()} 
            </div>

            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
            
            {selectedImages.length > 0 ? (
              <><div className="flex items-center gap-4 absolute right-10 z-40 top-4 rounded-sm transition-opacity">
              
                {currentView === "photos" ? (
                  <>
                    {areAllSelectedImagesFavorites() ? (
                      <button
                        onClick={() => removeFromFavourites(selectedImages)}
                        title="Remove from favorites"
                      >
                        <RemoveFavouritesIcon className="h-6 w-6" />
                      </button>
                    ) : (
                      <button
                        onClick={() => addToFavourites(selectedImages)}
                        title="Add to favorites"
                      >
                        <FavouritesIcon className="h-6 w-6" />
                      </button>
                    )}
                    <button onClick={() => setIsAddToAlbumDialogOpen(true)}>
                      <AlbumsIcon className="h-6 w-6" />
                    </button>
                    <button onClick={handleDeleteImagesClick}>
                      <TrashIcon className="h-6 w-6" />
                    </button>
                    <button onClick={() => downloadImages(selectedImages)}>
                      <Download className="h-6 w-6" />
                    </button>
                  </>
                ) : currentView === "trash" ? (
                  <button onClick={handleRecoverImagesClick}>
                    <RefreshCcw className="h-6 w-6" />
                  </button>
                ) : currentView === "favorites" ? (
                  <>
                  {areAllSelectedImagesFavorites() ? (
                    <button
                      onClick={() => removeFromFavourites(selectedImages)}
                      title="Remove from favorites"
                    >
                      <RemoveFavouritesIcon className="h-6 w-6" />
                    </button>
                  ) : (
                    <button
                      onClick={() => addToFavourites(selectedImages)}
                      title="Add to favorites"
                    >
                      <FavouritesIcon className="h-6 w-6" />
                    </button>
                  )}
                  
                  <button onClick={handleDeleteImagesClick}>
                    <TrashIcon className="h-6 w-6" />
                  </button>
                  <button onClick={() => downloadImages(selectedImages)}>
                    <Download className="h-6 w-6" />
                  </button>
                </>
                ) : currentView === "albums" ? (
                  <>
                  {areAllSelectedImagesFavorites() ? (
                    <button
                      onClick={() => removeFromFavourites(selectedImages)}
                      title="Remove from favorites"
                    >
                      <RemoveFavouritesIcon className="h-6 w-6" />
                    </button>
                  ) : (
                    <button
                      onClick={() => addToFavourites(selectedImages)}
                      title="Add to favorites"
                    >
                      <FavouritesIcon className="h-6 w-6" />
                    </button>
                  )}
                  <button
onClick={handleRemoveFromAlbumClick}
                    title="Remove from album"
                  >
                    <FolderX className="h-6 w-6" />
                  </button>
                  <button onClick={handleDeleteImagesClick}>
                    <TrashIcon className="h-6 w-6" />
                  </button>
                  <button onClick={() => downloadImages(selectedImages)}>
                    <Download className="h-6 w-6" />
                  </button>
                </>
                ) : null
                
                }
                                <Button onClick={() => router.push("/")} variant="destructive" size="icon" className="right-4 pointer-events-auto cursor-pointer">
                        <LogOut  className="size-4" />
                      </Button>
              </div>
              
              <Dialog3 
  open={isAddToAlbumDialogOpen}   
  onOpenChange={(isOpen) => {
    setIsAddToAlbumDialogOpen(isOpen);
    if (!isOpen) setSelectedAlbumId(null); // Reset selectedAlbumId when closing
  }}
>
  <DialogContent3 className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Add to Album</DialogTitle>
    </DialogHeader>
    <Select onValueChange={(value) => setSelectedAlbumId(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an Album" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {albums.map((album) => (
            <SelectItem key={album.album_id} value={album.album_id}>
              {album.album_name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
    <DialogFooter>
      <Button
        onClick={() => {
          if (selectedAlbumId) {
            addToAlbum(selectedImages, selectedAlbumId);
          } else {
            alert("Please select an album.");
          }
        }}
        disabled={isAddingToAlbum || !selectedAlbumId || selectedImages.length === 0}
        className="w-full"
      >
        {isAddingToAlbum && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
        {isAddingToAlbum ? "Adding to Album..." : "Add to Album"}
      </Button>
    </DialogFooter>
  </DialogContent3>
</Dialog3>

                
                </>
              
            ) : (
              
              <div>
                
                <div className="flex items-center gap-4 right-4 absolute top-3">
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4" /> Upload Images
                  </Button>

                  <Button onClick={() => setIsAlbumDialogOpen(true)}>
                    <Library className="h-4 w-4" /> Create Album
                  </Button>

                  <Button onClick={() => router.push("/")} variant="destructive" size="icon" className="right-4 pointer-events-auto cursor-pointer">
                        <LogOut  className="size-4" />
                      </Button>
                </div>




                <Dialog2 open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogContent2 className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Upload Images</DialogTitle>
                    </DialogHeader>
                    <FileUploader
                      value={files}
                      onValueChange={setFiles}
                      dropzoneOptions={dropZoneConfig}
                      className="relative bg-background rounded-lg p-2"
                    >
                      <FileInput className="outline-dashed outline-1 outline-white">
                        <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
                          <FileSvgDraw />
                        </div>
                      </FileInput>
                      <FileUploaderContent>
                        {files &&
                          files.length > 0 &&
                          files.map((file, i) => (
                            <FileUploaderItem key={i} index={i}>
                              <Paperclip className="h-4 w-4 stroke-current" />
                              {/* <span>{file.name}</span> */}
                              {/* want the filename only for 24 chars */}
                              <span className="">
                                {file.name.length > 24
                                  ? `${file.name.slice(0, 24)}...`
                                  : file.name}
                              </span>
                            </FileUploaderItem>
                          ))}
                      </FileUploaderContent>
                    </FileUploader>
                    <DialogFooter>
                      <Button
                        onClick={() => uploadImages(files)}
                        disabled={isUploading || !files || files.length === 0}
                        className="w-full"
                      >
                        {isUploading && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
                        {isUploading ? "Uploading..." : "Upload Images"}
                      </Button>
                    </DialogFooter>
                  </DialogContent2>
                </Dialog2>

                <Dialog2 open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
                  <DialogContent2 className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Album</DialogTitle>
                      <DialogDescription>
                        Organize your photos by creating a new album.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center">
                        <Input
                          id="album-name"
                          placeholder="Enter album name"
                          className="col-span-4 "
                          value={albumName}
                          onChange={(e) => setAlbumName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => createAlbum(albumName)}
                        disabled={isCreating || !albumName}
                        className="w-full"
                      >
                        {isCreating && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
                        {isCreating ? "Creating..." : "Create Album"}
                      </Button>
                    </DialogFooter>
                  </DialogContent2>
                </Dialog2>
              </div>
            )}


          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="fixed bottom-4 right-4 z-50 shadow-lg bg-background p-2 rounded-full transition-all hover:scale-110"
          >
            {mounted && (theme === "dark" ? <Sun className="h-[1.5rem] w-[1.5rem]" /> : <Moon className="h-[1.5rem] w-[1.5rem]" />)}
          </Button>
        </header>

        <div className="flex flex-1 flex-col p-4 pt-6 overflow-auto">

          {currentView === 'photos' && (
            isFetchingImages ? (
              <div className="flex flex-1 flex-col gap-1 p-4 pt-0">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid auto-rows-min gap-1 md:grid-cols-6">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                      <div key={colIndex} className="aspect-video bg-muted/50" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              photoData.length > 0 ? (
                <PhotoGallery
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  photoData={photoData}
                />
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                  <EmptyPhotosIcon className="w-24 h-24 text-muted-foreground" />
                  <h2 className="text-2xl font-bold">Ready to add some photos?</h2>
                  <p className="text-sm text-muted-foreground">
                    Just click on the upload images button
                  </p>
                </div>
              )
            )
          )}
          {currentView === 'albums' && currentAlbumId && (
            isFetchingAlbumPhotos ? (
              <div className="flex flex-1 flex-col gap-1 p-4 pt-0">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid auto-rows-min gap-1 md:grid-cols-6">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                      <div key={colIndex} className="aspect-video bg-muted/50" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              albumPhotos.length > 0 ? (
                <AlbumGallery
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  photos={albumPhotos}
                />
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                  <EmptyAlbumIcon className="w-24 h-24 text-muted-foreground" />
                  <h2 className="text-2xl font-bold">No photos in this album yet</h2>
                  <p className="text-sm text-muted-foreground">
                    Start by adding some images to your album
                  </p>
                </div>
              )
            )
          )}
          {currentView === 'favorites' && (
            isFetchingFavorites ? (
              <div className="flex flex-1 flex-col gap-1 p-4 pt-0">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid auto-rows-min gap-1 md:grid-cols-6">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                      <div key={colIndex} className="aspect-video bg-muted/50" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              favoritePhotos.length > 0 ? (
                <PhotoGallery
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  photoData={favoritePhotos}
                />
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                  <EmptyFavouritesIcon className="w-24 h-24 text-muted-foreground" />
                  <h2 className="text-2xl font-bold">No favorites yet</h2>
                  <p className="text-sm text-muted-foreground">
                    Mark your best photos as favorites to see them here
                  </p>
                </div>
              )
            )
          )}
          {currentView === 'trash' && (
            isFetchingTrash ? (
              <div className="flex flex-1 flex-col gap-1 p-4 pt-0">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid auto-rows-min gap-1 md:grid-cols-6">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                      <div key={colIndex} className="aspect-video bg-muted/50" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              trashPhotos.length > 0 ? (
                <AlbumGallery
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  photos={trashPhotos}
                />
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                  <EmptyTrashIcon className="w-24 h-24 text-muted-foreground" />
                  <h2 className="text-2xl font-bold">Trash is empty</h2>
                  <p className="text-sm text-muted-foreground">
                    Deleted photos will appear here. They will be permanently deleted after 60 days.
                  </p>
                </div>
              )
            )
          )}

        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}