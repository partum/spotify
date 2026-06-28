export default function AlbumList({ loading, error, totalAlbums, albums }) {
    return (
        <>
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            <p>There are {albums.length} full length albums</p>
            <button >Add More</button>

            {albums.map((album) => (
                <span key={album.id} className="album-item">
                    <input type="checkbox" defaultChecked={true} />
                    <label> {album.name}</label>
                </span>
            ))}
        </>
    )
}