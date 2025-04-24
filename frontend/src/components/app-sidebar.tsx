"use client";

import * as React from "react";
import { AlbumsIcon, FavouritesIcon, TrashIcon } from "@/components/icons";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

interface userInfo {
  name: string;
  email: string;
}

interface Album {
  album_name: string;
  album_id: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userInfo: userInfo;
  albums: Album[];
  onAlbumClick?: (albumId: string) => void;
  onFavoritesClick?: () => void;
  onTrashClick?: () => void;
  setCurrentView?: (view: 'photos' | 'albums' | 'favorites' | 'trash') => void;
  setCurrentAlbumId?: (id: string | null) => void;
  onAlbumUpdate: () => void; // Add this prop
  currentView: 'photos' | 'albums' | 'favorites' | 'trash';
  currentAlbumId: string | null;
}

export function AppSidebar({ 
  userInfo, 
  albums, 
  onAlbumClick, 
  onFavoritesClick,
  onTrashClick,
  setCurrentView,
  setCurrentAlbumId,
  onAlbumUpdate,
  currentView,
  currentAlbumId,
  ...props 
}: AppSidebarProps) {
  if (!userInfo) {
    return null;
  }
  
  const { name, email } = userInfo;

  const data = {
    user: { name, email, avatar: "https://github.com/shadcn.png" },
    navMain: [
      {
        title: "Albums",
        url: "albums",
        icon: AlbumsIcon,
        isActive: false,
        items: albums?.map((album) => ({
          title: album.album_name,
          id: album.album_id,
        })) || [],
        collapsible: true,
      },
      {
        title: "Favourites",
        icon: FavouritesIcon,
        onClick: onFavoritesClick,
        url: "favorites",
      },
      {
        title: "Trash",
        icon: TrashIcon,
        onClick: onTrashClick,
        url: "trash",
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          onAlbumClick={onAlbumClick}
          onFavoritesClick={onFavoritesClick}
          onTrashClick={onTrashClick}
          setCurrentView={setCurrentView}
          setCurrentAlbumId={setCurrentAlbumId}
          currentView={currentView}
          currentAlbumId={currentAlbumId}
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}