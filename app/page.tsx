import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">E-commerce Platform</h1>
        <p className="text-xl mb-8">Backend is running! Check the API documentation below.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/api-docs" className="w-full">
            <Button className="w-full h-24 text-lg" variant="outline">
              API Documentation
            </Button>
          </Link>
          <Link href="/admin" className="w-full">
            <Button className="w-full h-24 text-lg" variant="default">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
