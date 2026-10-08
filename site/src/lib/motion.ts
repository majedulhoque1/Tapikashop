// GSAP setup shared by every animated surface: registers plugins once (client only) and re-exports what components need. Used by SiteChrome (site-wide reveals) and the home page.
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP)

/** Brand "arrival" ease, cubic-bezier(0.16, 1, 0.3, 1) is expo-out in all but name. */
export const EASE_OUT = 'expo.out'
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export { gsap, ScrollTrigger, useGSAP }

/**
 * Inline <head> script: hides [data-reveal] before first paint so SSR content does not flash then vanish.
 * Skipped under reduced motion, and undone after 4s if the app never hydrates (content is never lost).
 */
export const MOTION_HEAD_SCRIPT = `(function(){var d=document.documentElement;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion');setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('motion')},4000)})()`

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Page-level scroll reveal: fades + lifts every [data-reveal] (not "manual") inside `scope` as it scrolls in, once.
 * Call it from the page component (not the layout) so it runs only after that route has hydrated.
 */
export function useReveal(scope: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>('[data-reveal]:not([data-reveal="manual"])')
      if (reducedMotion()) {
        gsap.set(els, { autoAlpha: 1 })
        return
      }
      gsap.set(els, { autoAlpha: 0, y: 28 })
      ScrollTrigger.batch(els, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.07, overwrite: true }),
      })
    },
    { scope },
  )
}
