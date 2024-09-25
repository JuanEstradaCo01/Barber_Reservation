import "./404notFound.css"
import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <body id="body404NotFound">
            <div class="container">
                <div class="content">
                    <h1 className="h1404">404</h1>
                    <p className="p404">¡Pagina no encontrada!</p>
                    <Link to={"/"} class="back-button">Volver a la pagina principal</Link>
                </div>
            </div>
        </body>
    )
}

export default NotFoundPage;