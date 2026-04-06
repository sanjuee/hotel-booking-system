export default function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-header border-b border-secondary">
            <div className="flex justify-between items-centetr px-12 py-5 max-w-[1920px] mx-auto">
                <div className="text-2xl font-semibold font-headline italic text-logo tracking-tight">    
                        HotelName
                </div>
                <nav className="hidden md:flex gap-12 items-center">
                    <a className="font-headline text-xs tracking-[0.2em] uppercase text-secondary
                                    border-b border-secondary/60 pb-1 transition-all duration-300"
                        href="#" > Home </a>
                    <a className="font-headline text-xs tracking-[0.2em] uppercase text-secondary
                                    border-b border-secondary/60 pb-1 transition-all duration-300"
                        href="#" > Rooms </a>
                    <a className="font-headline text-xs tracking-[0.2em] uppercase text-secondary
                                    border-b border-secondary/60 pb-1 transition-all duration-300"
                        href="#" > Contact </a>
                    <a className="font-headline text-xs tracking-[0.2em] uppercase text-secondary
                                    border-b border-secondary/60 pb-1 transition-all duration-300"
                        href="#" > About Us </a>
                </nav>
                <button className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-medium tracking-wide 
                                    hover:brightness-90 hover:cursor-pointer transition-all duration-300 shadow-sm text-sm" >
                            Book Your Stay
                </button>
            </div>
        </header>
    )
}