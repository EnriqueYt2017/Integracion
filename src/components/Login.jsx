/* eslint-disable no-unused-vars */
import React, {useState} from "react"
import Imagen from '../assets/loginimage.jpg'
import ImageProfile from '../assets/react.svg'

import appFirebase from "../credenciales"
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth"
const auth = getAuth(appFirebase)

const Login = () => {

    const [registrando, setRegistrando] = useState(false)

    const functAutentificacion = async(e) => {
        e.preventDefault();
        const correo = e.target.email.value;
        const contraseña = e.target.password.value;
        
        if (registrando) {
            try{
                await createUserWithEmailAndPassword(auth, correo, contraseña)
            } catch (error) {
                alert("Asegurese que la contraseña tenga al menos 8 caracteres")
            }

        }
        else {
            try{
                await signInWithEmailAndPassword(auth, correo, contraseña)
            } catch (error) {
                    alert("El usuario o la contraseña son incorrectos")
            }
            await signInWithEmailAndPassword(auth, correo, contraseña)
        }
        
    }

    return (
      <div className="container">
        <div className="row">
                {/*columna pequeña para formulario*/}
            <div className="col-md-4">
                <div className="padre">
                    <div className="card card-body shadow-lg">
                        <h2 className="text-center">{registrando ? "Registrate" : "Inicia Sesion"}</h2>
                        <img src={ImageProfile} alt="" className="estilo-profile" />
                        <form onSubmit={functAutentificacion}>
                            <input type="text" placeholder="Ingresar Email" className="cajatexto" id="email" />
                            <input type="password" placeholder="Ingresar Contraseña" className="cajatexto" id="password" />
                            <button className="btnform">{registrando ? "Registrate" : "Inicia Sesion"}</button>
                        </form>
                        <h4 className="texto" >{registrando ? "Si ya tienes cuenta" : "No tienes cuenta"} <button className="btnswitch" onClick={()=>setRegistrando(!registrando)}>{registrando ? "Inicia Sesion" : "Registrate"}</button></h4>
                    </div>
                </div>
            </div>

                {/*columna mas grande*/}
            <div className="col-md-8">
                <img src={Imagen} alt="" className="tamaño-imagen" />
            </div>
        </div>
      </div>
    )
  }

export default Login