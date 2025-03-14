import type React from "react"
export const Button = ({
  children,
  size,
  className,
  type,
}: { children: React.ReactNode; size?: string; className?: string; type?: "button" | "submit" | "reset" }) => {
  let sizeClass = ""
  if (size === "lg") {
    sizeClass = "px-8 py-4 text-lg"
  }

  return (
    <button
      type={type || "button"}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${sizeClass} ${className}`}
    >
      {children}
    </button>
  )
}

