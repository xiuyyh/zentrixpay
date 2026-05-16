
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const tasks = [
  {
    id: "1",
    company: "SwiftPay Solutions",
    reward: "$5.00",
    category: "Fintech",
    rating: 4.8,
    reviews: 1240,
    difficulty: "Low",
    image: PlaceHolderImages[2].imageUrl
  },
  {
    id: "2",
    company: "EcoSphere Systems",
    reward: "$7.50",
    category: "Software",
    rating: 4.2,
    reviews: 850,
    difficulty: "Medium",
    image: PlaceHolderImages[1].imageUrl
  },
  {
    id: "3",
    company: "HealthCore AI",
    reward: "$4.00",
    category: "HealthTech",
    rating: 4.5,
    reviews: 2100,
    difficulty: "Low",
    image: PlaceHolderImages[3].imageUrl
  },
  {
    id: "4",
    company: "Logix Global",
    reward: "$12.00",
    category: "Logistics",
    rating: 3.9,
    reviews: 4500,
    difficulty: "High",
    image: PlaceHolderImages[0].imageUrl
  },
  {
      id: "5",
      company: "CloudBound VPN",
      reward: "$6.00",
      category: "Security",
      rating: 4.7,
      reviews: 980,
      difficulty: "Medium",
      image: PlaceHolderImages[2].imageUrl
  },
  {
      id: "6",
      company: "GrowthLabs",
      reward: "$3.50",
      category: "Marketing",
      rating: 4.1,
      reviews: 560,
      difficulty: "Low",
      image: PlaceHolderImages[1].imageUrl
  }
]

export default function TasksPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Task Marketplace</h2>
          <p className="text-muted-foreground">Select a company to review and start earning.</p>
        </div>
        <div className="hidden md:flex gap-2">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border">All Categories</Badge>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border">Highest Paid</Badge>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border">Recent</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="group border-border/50 bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col">
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div className="size-14 relative rounded-2xl overflow-hidden border bg-white p-2">
                  <Image 
                    src={task.image} 
                    alt={task.company} 
                    fill 
                    className="object-contain"
                  />
                </div>
                <Badge className="bg-accent text-accent-foreground font-bold text-sm h-8 rounded-lg">
                  {task.reward}
                </Badge>
              </div>
              <div className="mt-4">
                <CardTitle className="font-headline text-xl group-hover:text-accent transition-colors">
                  {task.company}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{task.category}</p>
              </div>
            </CardHeader>
            <CardContent className="px-6 flex-grow">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-yellow-500">
                  <Star className="size-4 fill-current mr-1" />
                  <span className="font-bold text-foreground">{task.rating}</span>
                </div>
                <div className="text-muted-foreground">
                   {task.reviews.toLocaleString()} reviews
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                 <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase font-bold tracking-tighter">
                   Difficulty: {task.difficulty}
                 </Badge>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 mt-auto">
              <Link href={`/tasks/${task.id}`} className="w-full">
                <Button className="w-full bg-secondary hover:bg-primary text-foreground hover:text-white transition-all font-semibold h-11">
                  View Details
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
