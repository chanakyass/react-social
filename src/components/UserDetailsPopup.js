import { OverlayTrigger, Popover } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export function UserDetailsPopup(props) {
  const { owner } = props;

  return (
    <OverlayTrigger
      key="top"
      placement="top"
      //delay={{ show: 100, hide: 3000 }}
      overlay={
        <Popover id={"popover-positioned-top"}>
          <Popover.Title as="h3">{owner.name}</Popover.Title>
          <Popover.Content>{owner.userSummary}</Popover.Content>
        </Popover>
      }
    >
      <div style={ {display: 'inline-block'}} >
        <cite>
          <Link className="text-secondary" to={`/profile/${owner.id}`}>
            {owner.name}
          </Link>
        </cite>
      </div>
    </OverlayTrigger>
  );
}
