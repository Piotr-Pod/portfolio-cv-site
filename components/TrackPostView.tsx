'use client'

import { useEffect } from 'react'
import { useTrackPostView } from '@/lib/hooks/use-track-post-view'

interface Props {
  postId: string
}

export default function TrackPostView({ postId }: Props) {
  useTrackPostView(postId)
  useEffect(() => {
  }, [postId])
  return null
}


