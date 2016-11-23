
CREATE TABLE customer (
    id serial PRIMARY KEY,
    username text,
    email text,
    password text,
    first_name text,
    last_name text
);

CREATE TABLE product (
    id serial PRIMARY KEY,
    name text,
    price integer,
    description text,
    image_path text -- a URL for the product image
);

-- authentication tokens are
-- for verifying that a user has already
-- logged in with a valid username and password
-- they will prove that they've logged in by
-- providing the authentication token that they've
-- been given at the end of a successful login
CREATE TABLE auth_token (
    token text PRIMARY KEY,
    token_expires timestamp DEFAULT now() + interval '30 days',
    customer_id integer
);

-- a purchase is made by a customer and is associated
-- to a number of products through the product_in_purchase table.
CREATE TABLE purchase (
    id serial PRIMARY KEY,
    customer_id integer,
    total_price integer
);

-- product_in_purchase associates a product with a purchase
CREATE TABLE product_in_purchase (
    id serial PRIMARY KEY,
    product_id integer,
    purchase_id integer
);

-- product_in_shopping_cart links a product to a customer
-- if the product is linked to the customer that means
-- the product is currently in the customer's shopping cart
CREATE TABLE product_in_shopping_cart (
    id serial PRIMARY KEY,
    product_id integer,
    customer_id integer
);
