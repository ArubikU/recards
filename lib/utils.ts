import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function trailJson(text: string) {
  //Find first { symbol and latest } symbol
  const firstIndex = text.indexOf("{")
  const lastIndex = text.lastIndexOf("}")
  //If there is no { or } symbol, return empty string
  if (firstIndex === -1 || lastIndex === -1) {
    console.log(text)
    return ""
  }
  //If there is no } symbol after { symbol, return empty string
  if (lastIndex < firstIndex) {
    console.log(text)
    return ""
  }
  //If there is no } symbol before { symbol, return empty string
  if (lastIndex > text.length) {
    console.log("lastIndex > text.length")
    console.log(text)
    return ""
  }
  //return string between { and } 
  console.log(text.substring(firstIndex, lastIndex + 1))
  return text.substring(firstIndex, lastIndex + 1)



}
export function trailListJson(t: string) {
  const text = t.toString()
  //Find first [ symbol and latest ] symbol
  const firstIndex = text.indexOf("[")
  const lastIndex = text.lastIndexOf("]")
  //If there is no [ or ] symbol, return empty string
  if (firstIndex === -1 || lastIndex === -1) {
    console.log("firstIndex === -1 || lastIndex === -1")
    return text.toString()
  }
  //If there is no ] symbol after [ symbol, return empty string
  if (lastIndex < firstIndex) {
    console.log("lastIndex < text.length")
    console.log(text)
    return text
  }
  //If there is no ] symbol before [ symbol, return empty string
  if (lastIndex > text.length) {
    console.log("lastIndex > text.length")
    console.log(text)
    return text
  }
  //return string between [ and ] 
  console.log(text.substring(firstIndex, lastIndex + 1))
  return text.substring(firstIndex, lastIndex + 1)

}