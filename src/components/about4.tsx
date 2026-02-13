import { Button } from '@/components/ui/button'

const About4 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-28 text-center">
          <h1 className="text-4xl font-semibold md:text-7xl">About Prevema</h1>
          <p className="text-muted-foreground text-xl font-medium">
            Discover how we're revolutionizing event planning with intuitive tools that empower
            organizers to create unforgettable experiences.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <img
            src="https://images.unsplash.com/photo-1638132704795-6bb223151bf7"
            alt="placeholder"
            className="h-80 min-h-80 w-full rounded-lg object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1651313947982-59d4049e5834"
            alt="placeholder"
            className="h-80 min-h-80 w-full rounded-lg object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1675716921224-e087a0cca69a"
            alt="placeholder"
            className="h-80 min-h-80 w-full rounded-lg object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1545150665-c72a8f0cf311"
            alt="placeholder"
            className="h-80 min-h-80 w-full rounded-lg object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1560523160-754a9e25c68f"
            alt="placeholder"
            className="h-80 min-h-80 w-full rounded-lg object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04"
            alt="placeholder"
            className="h-80 min-h-80 w-full rounded-lg object-cover"
          />
        </div>
        <div className="mx-auto grid max-w-5xl gap-28 py-28 md:grid-cols-2">
          <div>
            <h2 className="mb-5 text-4xl font-semibold">Our Vision</h2>
            <p className="text-muted-foreground text-xl font-medium leading-8">
              For years, event planning has been fragmented across multiple tools and platforms.
              Organizers juggle spreadsheets, email clients, design software, and communication
              tools—wasting time and risking errors.
              <br />
              <br />
              What if you could manage everything from one powerful platform? What if planning
              conferences, webinars, and corporate gatherings was as simple as a few clicks?
              <br />
              <br />
              With Prevema, you can! Our all-in-one platform streamlines team setup, participant
              management, communications, and execution—all without the complexity.
              <br />
              <br />
              We believe that every event organizer deserves tools that save time, boost efficiency,
              and deliver unforgettable experiences.
            </p>
          </div>
          <div>
            <h2 className="mb-5 text-4xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground text-xl font-medium leading-8">
              Prevema was built by event professionals who understand the challenges of coordinating
              complex gatherings. We've experienced the frustration of scattered tools and manual
              workflows firsthand.
              <br />
              <br />
              We created Prevema to solve these problems—not just for ourselves, but for every event
              planner who wants to focus on creating memorable experiences instead of wrestling with
              technology.
              <br />
              <br />
              Our platform combines effortless data collection, custom forms, AI-powered email
              templates, smart automations, and professional design tools into one seamless
              workflow. From team creation to execution, Prevema handles it all.
              <br />
              <br />
              We're dedicated to empowering organizers with intuitive tools that make event planning
              a breeze. We can't wait to see the amazing events you'll create!
            </p>
          </div>
        </div>
        <div className="bg-muted/50 mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 rounded-2xl p-14 text-center md:flex-row md:text-left">
          <h3 className="text-3xl font-semibold">
            Ready to Transform
            <br />
            Your Event Planning?
          </h3>
          <Button
            asChild
            size="lg"
            style={{ backgroundColor: '#cebe06', color: '#000' }}
            className="hover:opacity-90"
          >
            <a href="/admin">Start Free Trial</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export { About4 }
