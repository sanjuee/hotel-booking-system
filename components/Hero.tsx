import Image from "next/image"
import SearchAvailabiltyBar from "./SearchAvailabilyBar"

export default function Hero() {
    return (
        // Adjusted padding: tighter on mobile (pt-16 pb-12), expansive on desktop (py-24)
        <section className="max-w-[1920px] mx-auto  pt-25 px-4 sm:px-6 md:px-8 lg:px-16 pt-16 pb-12 md:py-20 lg:py-24 flex flex-col gap-10 md:gap-12 lg:gap-16">
            
            {/* Header Content & Search - Stacked on Mobile/Tablet, Row on Desktop */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 w-full">
                
                <div className="max-w-2xl w-full flex flex-col gap-4 md:gap-6">
                    <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl xl:text-7xl text-on-surface leading-[1.1] sm:leading-[1.15] italic">
                        Welcome to Our Residence
                    </h1>
                    
                    <div className="flex flex-wrap gap-5 sm:gap-6 items-center mt-1 sm:mt-2">
                        <a className="text-foreground/70 border-b border-outline-variant/40 pb-1 font-label tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[11px] sm:text-xs hover:text-secondary hover:border-secondary transition-all" href="#">
                            Explore Our Suites
                        </a>
                        <a className="text-foreground/70 border-b border-outline-variant/40 pb-1 font-label tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[11px] sm:text-xs hover:text-secondary hover:border-secondary transition-all" href="#">
                            Discover Our Story
                        </a>
                    </div>
                </div>
                <div className="w-full lg:w-auto flex flex-col gap-1 sm:gap-4">
                    <span className="text-lg sm:text-xl font-headline text-secondary font-extralight italic ml-1 sm:ml-2">
                        Check room availability
                    </span>
                    <div className="w-full">
                        <SearchAvailabiltyBar />
                    </div>
                </div>
            </div>


            <div className="w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative group">
                <Image  
                    src='https://www.travelgeekery.com/wp-content/uploads/2018/03/Brunton-Boatyard-Hotel-Kerala-Courtyard.jpg'
                    alt="hotel courtyard" 
                    fill
                    priority // Ensures the hero image loads immediately
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
            </div>
        </section>
    )
}