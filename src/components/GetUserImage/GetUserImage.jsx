import emptyavatar from "../../assets/images/avatar.png";
import styles from './GetUserImage.module.css';

const GetUserImage = () => {
    return <img src={emptyavatar} className={styles.emptyavatar} alt="user-image" />;
}

export default GetUserImage;