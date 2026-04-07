
import Image from "next/image"
import SearchAvailabiltyBar from "./SearchAvailabilyBar"


export default function Hero() {
    // Date States
    

    return (
        <section className="max-w-[1920px] mx-auto px-4   sm:px-6 md:px-16  py-24 flex flex-col gap-10 lg:gap-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="max-w-xl w-full">
                    <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl text-on-surface leading-[1.1] italic mb-2 md:mb-3">
                        Welcome to Our Residence
                    </h1>
                    <div className="flex flex-row  gap-6 sm:gap-4  items-center">
                        <a className="text-foreground/60 border-b border-outline-variant/40 pb-1 font-label tracking-[0.2em] uppercase text-[10px] 
                                        sm:text-xs hover:text-secondary hover:border-secondary transition-all" href="#">
                            Explore Our Suites
                        </a>
                        <a className="text-foreground/60 border-b border-outline-variant/40 pb-1 font-label tracking-[0.2em] uppercase text-[10px] sm:text-xs hover:text-secondary hover:border-secondary transition-all" href="#">
                            Discover Our Story
                        </a>
                    </div>
                </div>
                <SearchAvailabiltyBar />
            </div>

            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative">
                <Image  
                    src='https://www.travelgeekery.com/wp-content/uploads/2018/03/Brunton-Boatyard-Hotel-Kerala-Courtyard.jpg'
                    alt="hotel courtyard" 
                    fill
                    className="object-cover"
                />
            </div>
        </section>
    )
}