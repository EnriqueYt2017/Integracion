/* eslint-disable no-unused-vars */
import { useState } from 'react'

//Importando los modulos de firebase
import appFirebase from './credenciales'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
const auth = getAuth(appFirebase)

//Impórtar nuestros componentes
import Login from './components/Login'
import Home from './components/Home'


import './App.css'

function App() {

  const [usuario, setUsuario] = useState(null)

  onAuthStateChanged(auth, (usuarioFirebase) => {
    if (usuarioFirebase) {
      setUsuario(usuarioFirebase)
    }else{
      setUsuario(null)
    }
  })

  return (
    <div>
      {usuario ? <Home correoUsuario = {usuario.email}  /> : <Login />}
    </div>
  )
}

export default App
