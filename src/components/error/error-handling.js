import history from '../../app-history'

export const handleError = (error) => {
    console.log(error);
    history.push('/error', error);
}