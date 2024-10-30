import Image from "next/image";
import Link from "next/link";

export default async function UnderConstruction(){
    return(
        <div className="flex flex-col justify-center items-center w-full min-h-[95dvh] h-full mx-auto">
            <Image src="/under_construction.svg" height={500} width={500} alt="Under Construction" />
            <h1 className="text-4xl font-bold text-center">Under Construction!</h1>
            <p className="text-center text-sm text-muted-foreground mt-2">
                Working on it. Please come back later.
            </p>
            <Link 
                href='/'
                className="bg-primary text-white p-2 rounded-md hover:bg-primary/95 font-medium mt-2 hover:shadow-sm hover:shadow-primary/50 hover:rounded-md transition-all duration-200"

            >
                Go Back to Home
            </Link>            
        </div>
    )
}