import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

type TopNavbarProps = {
  userName: string;
  onLogout: () => void;
};

export default function TopNavbar({ userName, onLogout }: TopNavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/signin');
  };

  return (
    <Navbar
      bg="light"
      variant="light"
      expand="lg"
      className="px-4 shadow-sm fixed-top"
      style={{ borderBottom: '1px solid #ddd', zIndex: 1000 }}
    >
      <Container fluid>
        <Navbar.Brand href="#" className="fw-bold text-primary">
          Norsys Docs
        </Navbar.Brand>
        <Nav className="ms-auto d-flex align-items-center">
          <NavDropdown title={userName} id="profile-dropdown" align="end">
            <NavDropdown.Item href="/profile">Profil</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item as="button" onClick={handleLogout}>
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
