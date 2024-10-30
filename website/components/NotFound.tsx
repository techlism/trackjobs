import Image from "next/image";
import Link from "next/link";

export default async function NotFound(){
    return(
        <div className="flex flex-col justify-center items-center w-full min-h-[95dvh] m-auto">
            <Image src="/not_found.svg" height={500} width={500} alt="Under Construction" />
            <h1 className="text-4xl font-bold text-center">Page Not Found</h1>
            <p className="text-center text-sm text-muted-foreground mt-2">
                Looks like you've come to an invalid page or route.
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