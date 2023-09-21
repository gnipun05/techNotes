import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const DashFooter = () => {

  const { username, status } = useAuth() // custom hook to get the username and status from the token

  const navigate = useNavigate(); // used to navigate to the routes
  const { pathname } = useLocation(); // to get the path name from the URL

  const onGoHomeClicked = () => navigate('/dash')

  let goHomeButton = null;

  if(pathname !== '/dash') {
    goHomeButton = (
        <button
            className="dash-footer__button icon-button" 
            title="Home"
            onClick={onGoHomeClicked}
        >
            <FontAwesomeIcon icon={faHouse} />
        </button>
    )
  }

  const content = (
    <footer className="dash-footer">
        {goHomeButton}
        <p> Current User: {username}</p>
        <p> Status: {status}</p>

    </footer>
  )

  return content;
}

export default DashFooter