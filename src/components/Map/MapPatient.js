import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as ELG from "esri-leaflet-geocoder";
// import { googleTranslate } from '../../components/Translate/GoogleTranslate';

const MERCATOR_TILES_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function MapPatient(props) {

    const [position, setPosition] = useState([13.74, 100.49]); // [13.74, 100.49]
    const [address, setAddress] = useState('Bangkok');

    // Map
    const markerRef = useRef(null);

    useEffect(() => {
        if (props.latAddress !== null && props.lngAddress !== null) {
            setPosition([props.latAddress, props.lngAddress])
            props.markLocation({ lat: props.latAddress, lng: props.lngAddress });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // console.log([props.latAddress, props.lngAddress])
    function Geocoder({ address }) {
        const map = useMap();
        if (props?.latAddress !== null && props?.lngAddress !== null) {
            // console.log([props.latAddress, props.lngAddress])
            // setPosition([props.latAddress, props.lngAddress])
            map.setView([props?.latAddress, props?.lngAddress])
        } else {
            ELG.geocode()
                .text(address)
                .run((err, results,) => {
                    // console.log(address)
                    // console.log(results, err, response);
                    const { lat, lng } = results.results[0].latlng;

                    if (position[0] !== lat && position[1] !== lng) {
                        setPosition([lat, lng]);
                        props.markLocation({ lat: lat, lng: lng });
                    }
                    map.setView([lat, lng]);
                });
        }

        return null;
    }

    const getAddressText = () => {

        // let tranData = await googleTranslate(props.address.length !== 0 ? props.address : 'กรุงเทพ');
        // await console.log('Y : ', tranData.eng.length, tranData.eng);
        // await setAddress(tranData.eng.length !== 0 ? tranData.eng : 'Bangkok');

        console.log('Y : ', props.address.length, props.address);
        setAddress(props.address.length !== 0 ? props.address : 'Bangkok');
    }

    useEffect(() => {

    }, [position]);

    useEffect(() => {
        getAddressText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, props.address]);


    return (
        <div className="map__container">
            <MapContainer
                style={{
                    width: "160%",
                    height: 300,
                }}
                center={position}
                zoom={16}
                minZoom={1}
            >
                <TileLayer url={MERCATOR_TILES_URL} />
                <Marker
                    position={position}
                    draggable={true}
                    eventHandlers={{
                        click: (e) => {
                            // props.markLocation(e.latlng);
                            props.markLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
                        },
                        dragend() {
                            const marker = markerRef.current
                            if (marker != null) {
                                const { lat, lng } = marker._latlng
                                props.markLocation({ lat: lat, lng: lng });
                            }
                        }
                    }}
                    ref={markerRef}
                >
                    <Popup>
                        ตำเเหน่งที่เลือกเเล้ว
                    </Popup>
                </Marker>
                <Geocoder address={props.address} />
            </MapContainer>
        </div>
    )
}