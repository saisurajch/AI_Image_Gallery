"use client"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Heart, Share2, Trash2, Edit, Info, X } from "lucide-react"

interface PhotoViewProps {
  photo: {
    id: number
    src: string
    alt: string
  } | null
  onClose: () => void
}

export function PhotoView({ photo, onClose }: PhotoViewProps) {
  if (!photo) return null

  return (
    <Dialog open={!!photo} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black text-white">
        <div className="relative h-[85vh]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white bg-black/40 hover:bg-black/60 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <Image
            src={photo.src || "/placeholder.svg"}
            alt={photo.alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 80vw"
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm">{photo.alt}</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                  <Edit className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                  <Info className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}