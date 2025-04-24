import { ChevronRight, Key, Pencil, Trash2, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { PhotosIcon } from "@/components/icons"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
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
import { SpinnerIcon } from "@/components/icons";
import { ToastAction } from "@/components/ui/toast"
import { useRouter } from "next/navigation";

interface NavMainProps {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    collapsible?: boolean;
    onClick?: () => void;
    items?: {
      title: string;
      id?: string;
    }[];
  }[];
  currentView: 'photos' | 'albums' | 'favorites' | 'trash';
  currentAlbumId?: string | null;
  onAlbumClick?: (albumId: string) => void;
  onFavoritesClick?: () => void;
  onTrashClick?: () => void;
  setCurrentView?: (view: 'photos' | 'albums' | 'favorites' | 'trash') => void;
  setCurrentAlbumId?: (id: string | null) => void;
  onAlbumUpdate?: () => void; // Add this prop
}

export function NavMain({ 
  items, 
  onAlbumClick, 
  setCurrentView,
  setCurrentAlbumId,
  onAlbumUpdate,
  currentView,
  currentAlbumId,
}: NavMainProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isDeleteAlbumAlertOpen, setIsDeleteAlbumAlertOpen] = useState(false);
  const [pendingDeleteAlbumId, setPendingDeleteAlbumId] = useState<string | null>(null);
  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false);
  const handleDeleteAlbumClick = (albumId: string) => {
    setPendingDeleteAlbumId(albumId);
    setIsDeleteAlbumAlertOpen(true);
  };
  const router = useRouter();

  const handleEditAlbum = async () => {
    console.log("Editing name")
    if (!editingAlbumId || !newAlbumName) return;

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
      
      const response = await fetch("https://bottleneckapi.saisurajch.me/albums/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            album_id: editingAlbumId,
            new_name: newAlbumName,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update album name");
      }

      setIsEditDialogOpen(false);
      setEditingAlbumId(null);
      setNewAlbumName("");

      toast({
        title: "Success",
        description: "Updated album name successfully",
      });

      onAlbumUpdate?.();
      // Reload the page to reflect changes
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete album: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!albumId) return;
    setIsDeletingAlbum(true);
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

      const response = await fetch("https://bottleneckapi.saisurajch.me/albums/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            album_id: albumId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete album");
      }
      setIsDeleteAlbumAlertOpen(false);
      setPendingDeleteAlbumId(null);
      toast({
        title: "Success",
        description: "Album deleted successfully",
      });
      onAlbumUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete album: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeletingAlbum(false);
    }
  };

  return (
    <SidebarGroup>
            <AlertDialog 
        open={isDeleteAlbumAlertOpen} 
        onOpenChange={setIsDeleteAlbumAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete album?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the album. The images within the album will remain in your gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsDeleteAlbumAlertOpen(false);
                if (pendingDeleteAlbumId) {
                  handleDeleteAlbum(pendingDeleteAlbumId);
                  setPendingDeleteAlbumId(null);
                }
              }}
              disabled={isDeletingAlbum}
            >
                {isDeletingAlbum && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
                {isDeletingAlbum ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SidebarMenu>
        <SidebarMenuItem key="Photos">
          <SidebarMenuButton
            asChild
            tooltip="Photos"
            onClick={() => {
              setCurrentView?.('photos');
              setCurrentAlbumId?.(null);
            }}
            className={currentView === 'photos' ? "bg-accent" : ""}

          >
            <a href="#" className="flex items-center w-full mt-2 mb-4">
              <PhotosIcon />
              <span>Photos</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarGroupLabel>Collections</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          item.collapsible && item.items?.length ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <div className="flex items-center w-full">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <div 
                        className={currentView === 'albums' && subItem.id === currentAlbumId ? "bg-accent flex items-center w-full" : "flex items-center w-full"}

                        >
                          <SidebarMenuSubButton
                            asChild
                            onClick={() => {
                              if (subItem.id && onAlbumClick) {
                                onAlbumClick(subItem.id);
                              }
                            }}
                            className="flex-grow"
                          >
                            <a href="#">
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAlbumId(subItem.id || null);
                              setNewAlbumName(subItem.title);
                              setIsEditDialogOpen(true);
                            }}
                            
                            className="p-1 hover:text-blue-500"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (subItem.id) {
                                handleDeleteAlbumClick(subItem.id);
                              }
                            }}
                            className="p-1 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                onClick={item.onClick}
                // onClick={() => console.log(item.url?.toString())}
                className={currentView === item.url ? "bg-accent" : ""}

              >
                <a href="#" className="flex items-center w-full">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Album Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="new-album-name"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="Enter new album name"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleEditAlbum}>Edit Album Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  )
}