import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    name: "Sarah Anderson",
    rating: 5,
    text: "An absolutely magnificent experience! The attention to detail is unparalleled. Every moment felt special.",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 5,
    text: "The best hotel I've ever stayed at. The staff went above and beyond to make our honeymoon unforgettable.",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Emma Thompson",
    rating: 4,
    text: "Wonderful stay with excellent service. The rooms are beautifully designed and very comfortable.",
    date: "6 weeks ago",
  },
]

export default function ReviewsSection() {
  return (
    <section className="py-20 px-4 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4">Guest Reviews</h2>
          <p className="text-lg text-muted">What our guests are saying about their experience</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-lg p-8 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < review.rating ? "fill-accent text-accent" : "text-muted"} />
                ))}
              </div>
              <p className="text-muted mb-6 leading-relaxed italic">"{review.text}"</p>
              <div>
                <p className="font-semibold text-primary">{review.name}</p>
                <p className="text-sm text-muted">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
