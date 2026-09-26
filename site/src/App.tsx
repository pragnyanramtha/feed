import { MotionConfig } from 'motion/react'
import { BirthdayIntro } from '@/components/sections/BirthdayIntro'
import { CinematicPhoto } from '@/components/sections/CinematicPhoto'
import { Favorites } from '@/components/sections/Favorites'
import { FinalSection } from '@/components/sections/FinalSection'
import { Hero } from '@/components/sections/Hero'
import { HorizontalMemories } from '@/components/sections/HorizontalMemories'
import { Letter } from '@/components/sections/Letter'
import { LilySection } from '@/components/sections/LilySection'
import { MemoryGallery } from '@/components/sections/MemoryGallery'
import { PhotoWall } from '@/components/sections/PhotoWall'
import { Timeline } from '@/components/sections/Timeline'
import { CustomCursor } from '@/components/global/CustomCursor'
import { FilmGrain } from '@/components/global/FilmGrain'
import { LoadingScreen } from '@/components/global/LoadingScreen'
import { useSiteReady } from '@/hooks/useSiteReady'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function App() {
  const ready = useSiteReady()
  useSmoothScroll(ready)

  return (
    <MotionConfig reducedMotion="user">
      <LoadingScreen visible={!ready} />
      <FilmGrain />
      <CustomCursor />
      <main>
        <Hero />
        <BirthdayIntro />
        <MemoryGallery />
        <CinematicPhoto />
        <LilySection />
        <HorizontalMemories />
        <Timeline />
        <Favorites />
        <PhotoWall />
        <Letter />
        <FinalSection />
      </main>
    </MotionConfig>
  )
}
