import "./adminView.css";
import { userContext } from "../context/Context";
import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"
import { Link, useNavigate, useParams } from "react-router-dom";
import MiniLoader from "../miniLoader/MiniLoader";
import Button from 'react-bootstrap/Button';

function AdminView(props) {

    const user = props.admin
    const { logOut } = useContext(userContext);
    const { uid } = useParams();
    const [bookings, setBookings] = useState("")
    const [loader, setLoader] = useState(true)

    const MySwal = withReactComponent(Swal)
    const navigate = useNavigate()

    useEffect(() => {
        //Consulto las reservas
        fetch(`${process.env.REACT_APP_URL_BACK}/reservas/${uid}`, {
            credentials: "include"
        })
            .then(res => res.json()
                .then(data => {
                    setLoader(false)
                    if (res.status === 200) {
                        //Valido que usuario tiene reserva
                        const list = []
                        data.body.forEach(item => {
                            if (item.Booking !== null) {
                                list.push(item)
                            }
                        });
                        setBookings(list)
                    } else if (res.status === 500) {
                        navigate("/")
                        MySwal.fire({
                            show: true,
                            title: `<strong>${data.message}</strong>`,
                            icon: "error",
                            showConfirmButton: true
                        })
                    }
                }))
            .catch((e) => {
                console.log(e)
            })
    }, [])

    return (
        <body id="bodyAdminProfile">
            <div className="divBtnSalir"><Link to={"/"}><Button onClick={logOut} variant="outline-danger">Cerrar sesion</Button>{' '}</Link></div>

            <div className="divSaludoAdmin">
                <h1>¡Hola {user.names}!</h1>
            </div>

            <br />
            <hr />
            <br />

            <div className="divProximasReservas">
                <h2>Próximas reservas:</h2>

                {loader === true ? <div className="contenedorLoaderTable"><MiniLoader /></div> : <>{bookings.length === 0 ? <h3>¡No hay reservas agendadas!</h3> :
                    <table>
                        <thead>
                            <tr>
                                <th data-label="Column 1">Fecha</th>
                                <th data-label="Column 2">Hora</th>
                                <th data-label="Column 3">Cliente</th>
                                <th data-label="Column 4">Telefono</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((item) => (
                                <tr>
                                    <td data-label="Column 1">{item.Booking.date}</td>
                                    <td data-label="Column 2">{item.Booking.time} {item.Booking.typeTime}</td>
                                    <td data-label="Column 3">{item.names} {item.surnames}</td>
                                    <td data-label="Column 4">{item.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}</>}
            </div>
        </body>
    )
}

export default AdminView;