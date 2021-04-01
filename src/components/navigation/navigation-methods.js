import NavBar from './NavBar'

export const withNavBar = (Component) => {
    return <NavBar>
        <Component />
    </NavBar>
}