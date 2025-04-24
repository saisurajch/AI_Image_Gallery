"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Download, Heart, Share2, Trash2, Edit, Info, X } from "lucide-react"

// Sample photo data organized by date
const photoData = [
  {
    date: "May 2024",
    subDate: "Tue, May 7, 2024",
    photos: [
      {
        id: 1,
        src: "/placeholder.svg?height=300&width=300",
        alt: "Sports player in red jersey",
        aspectRatio: "1/1",
      },
      {
        id: 2,
        src: "/placeholder.svg?height=300&width=400",
        alt: "Football player running",
        aspectRatio: "4/3",
      },
      {
        id: 3,
        src: "/placeholder.svg?height=300&width=400",
        alt: "Football player number 75",
        aspectRatio: "4/3",
      },
      {
        id: 4,
        src: "/placeholder.svg?height=300&width=400",
        alt: "Football player number 74",
        aspectRatio: "4/3",
      },
      {
        id: 5,
        src: "/placeholder.svg?height=300&width=400",
        alt: "Football player number 96",
        aspectRatio: "4/3",
      },
    ],
  },
  {
    date: "April 2024",
    subDate: "Mon, Apr 15, 2024",
    photos: [
      {
        id: 6,
        src: "/placeholder.svg?height=400&width=300",
        alt: "Landscape photo",
        aspectRatio: "3/4",
      },
      {
        id: 7,
        src: "/placeholder.svg?height=300&width=400",
        alt: "Family photo",
        aspectRatio: "4/3",
      },
      {
        id: 8,
        src: "/placeholder.svg?height=400&width=400",
        alt: "Pet photo",
        aspectRatio: "1/1",
      },
    ],
  },
  {
    date: "December 2023",
    subDate: "Sun, Dec 28, 2023",
    photos: [
      {
        id: 9,
        src: "/placeholder.svg?height=300&width=300",
        alt: "Holiday photo",
        aspectRatio: "1/1",
      },
      {
        id: 10,
        src: "/placeholder.svg?height=400&width=300",
        alt: "Winter landscape",
        aspectRatio: "3/4",
      },
    ],
  },
  {
    date: "Remember this day?",
    highlight: true,
    photos: [
      {
        id: 11,
        src: "/placeholder.svg?height=400&width=600",
        alt: "Memory from the past",
        aspectRatio: "3/2",
      },
    ],
  },
]

export function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    id: number
    src: string
    alt: string
  } | null>(null)

  return (
    <div className="space-y-8">
      {photoData.map((section) => (
        <div key={section.date} className="space-y-2">
          <div className="mb-4">
            <h2 className={cn("text-2xl font-medium", section.highlight && "text-primary")}>{section.date}</h2>
            {section.subDate && <p className="text-sm text-muted-foreground">{section.subDate}</p>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2">
            {section.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-sm cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background dark:bg-black text-foreground dark:text-white">
          <div className="relative h-[80vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-foreground dark:text-white bg-background/40 dark:bg-black/40 hover:bg-background/60 dark:hover:bg-black/60 rounded-full"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            {selectedPhoto && (
              <Image
                src={selectedPhoto.src || "/placeholder.svg"}
                alt={selectedPhoto.alt}
                fill
                className="object-contain"
                sizes="80vw"
              />
            )}
          </div>
          <div className="p-4 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 dark:from-black/80 to-transparent">
            <div className="flex justify-between items-center">
              <div>{selectedPhoto && <p>{selectedPhoto.alt}</p>}</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Edit className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Info className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

