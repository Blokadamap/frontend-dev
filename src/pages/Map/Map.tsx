import DefaultMap from "../../components/map/layers/DefaultMap";
import { Markers } from "../../constants/markers/Markers";

function Map(){
    // здесь будет hook для получения markers
    // const { markers, isLoading } = useMarkers()
    
    // if (isLoading) return (
    //      <div className="fullscreen-container">
    //          <DefaultMap markers={Markers} />
    //      </div>
    //  )


    return (
        <div className="fullscreen-container">
            <DefaultMap markers={Markers} />
        </div>
    )
}

export default Map;