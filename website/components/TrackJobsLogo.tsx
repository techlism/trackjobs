export default function TrackJobsLogo({width = 84, height = 84}: {width?: number, height?: number}) {
    return (
        <div className="m-1">
            <svg width={width} height={height} viewBox="0 0 91.812 95.762" className="track-jobs-logo">
                <path
                    fill="#5d17ea"
                    d="M74.239,2.17h-9.761v29.286H32.261V2.17h-9.762c-9.704,0-17.572,7.867-17.572,17.572v60.522
                    c0,9.212,7.09,16.751,16.107,17.498V63.671h8.135v34.165h10.738V63.671h35.797v34.091c9.018-0.747,16.107-8.286,16.107-17.498
                    V19.742C91.812,10.037,83.943,2.17,74.239,2.17z"
                />
            </svg>
        </div>
    )
}