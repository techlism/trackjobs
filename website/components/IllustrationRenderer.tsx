type IllustrationRendererProps = {
    illustrationPath: string;
    illustrationAlt: string;
}
export default function IllustrationRenderer({ illustrationPath, illustrationAlt }: IllustrationRendererProps) {
    return (
        <img src={illustrationPath} alt={illustrationAlt} className="select-none" height={200} width={200} />
    )
}   