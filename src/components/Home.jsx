import React from "react"
import appFirebase from "../credenciales"
import { getAuth, signOut } from "firebase/auth"

import Imagelogo from '../assets/icono-logo.png'

const auth = getAuth(appFirebase)

const Home = ({ correoUsuario }) => {
    return (
        <div>
            <h2 className="text-center">Bienvenido usuario {correoUsuario} </h2>
            <nav id="navbar-e" className="navbar bg-body-tertiary px-3 mb-3" >
                <a href="#" className="navbar-brand" ><img src={Imagelogo} alt="" className="estilo-logo" /></a>
                <ul className="nav nav-pills">
                    <li className="nav-item">
                        <a href="#" className="nav-link"><i class="bi bi-cart"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                        </svg></i></a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link">Pagina de Inicio</a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link">Productos</a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link">Servicios</a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link">Reservas</a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link">Contactenos</a>
                    </li>
                </ul>
                <button className="btn btn-primary" onClick={() => signOut(auth)} > Logout</button>
            </nav>
        </div>
    )
}

export default Home