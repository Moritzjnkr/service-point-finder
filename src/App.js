import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';

function App() {
  const [searchParams, setSearchParams] = useState({
    address: '',
    postalCode: '',
    city: '',
    country: 'Germany'
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSearchParams(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const fetchLocations = async () => {
    setLoading(true);
    setError('');
    const origins = `${searchParams.address}, ${searchParams.postalCode} ${searchParams.city}, ${searchParams.country}`;

    try {
      const response = await fetch(`http://localhost:3001/getDistanceMatrix?origins=${encodeURIComponent(origins)}`);
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError(`Failed to fetch locations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchLocations();
  };

  return (
    <Container className="mt-5">
      <h1>Find Nearest Drop-off Point</h1>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Address:</Form.Label>
              <Form.Control type="text" name="address" placeholder="Enter street address" value={searchParams.address} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Postal Code:</Form.Label>
              <Form.Control type="text" name="postalCode" placeholder="Enter postal code" value={searchParams.postalCode} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>City:</Form.Label>
              <Form.Control type="text" name="city" placeholder="Enter city" value={searchParams.city} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Country:</Form.Label>
              <Form.Control as="select" name="country" value={searchParams.country} onChange={handleChange}>
                <option value="Germany">Germany</option>
                <option value="Sweden">Sweden</option>
                <option value="Denmark">Denmark</option>
                <option value="Norway">Norway</option>
                <option value="Finland">Finland</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit">Search</Button>
      </Form>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      <Row xs={1} md={2} className="g-4">
        {locations.map((location, index) => (
          <Col key={index}>
            <Card>
              <Card.Body>
                <Card.Title>{location.address.name} - {location.status}</Card.Title>
                <Card.Text>
                  {location.description}
                  <br />
                  {`${location.address.addressLine1}, ${location.address.postalCode}, ${location.address.city}, ${location.address.country}`}
                  <br />
                  {location.distance && `Distance: ${location.distance}, Travel Time: ${location.duration}`}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default App;
