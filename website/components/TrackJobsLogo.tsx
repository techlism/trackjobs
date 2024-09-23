export default function TrackJobsLogo({width, height} : {width?: number, height?: number}) {
    return (
        <div className="m-1">
            <svg width={width || 35} height={height || 35} viewBox="0 0 32 32" fill="#5d17ea">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 5C0 2.23858 2.23858 0 5 0H27C29.7614 0 32 2.23858 32 5V27C32 29.7614 29.7614 32 27 32H5C2.23858 32 0 29.7614 0 27V5ZM5 6C5 5.44772 5.44772 5 6 5H10C10.5523 5 11 5.44772 11 6V26C11 26.5523 10.5523 27 10 27H6C5.44772 27 5 26.5523 5 26V6ZM13 6C13 5.44772 13.4477 5 14 5H18C18.5523 5 19 5.44772 19 6V14C19 14.5523 18.5523 15 18 15H14C13.4477 15 13 14.5523 13 14V6ZM21 6C21 5.44772 21.4477 5 22 5H26C26.5523 5 27 5.44772 27 6V20C27 20.5523 26.5523 21 26 21H22C21.4477 21 21 20.5523 21 20V6Z" fill="#5d17ea" />
            </svg>
        </div>

    )
}