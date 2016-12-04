![Alt text](picforreadme.png)

#FOURTHDIMENSION e-commerce website

www.fourthdimensionwatches.club

##Contents
  * Overview
  * Technologies
  * Screenshots

##Overview

FOURTHDIMENSION is an e-commerce website that sells high end watches. The website has a front page to
enter through. Once entered the customer can scroll through the available watches. If they see
a watch they like, they can click on the watch, which will direct them to a description page of the watch.
Here the customer has the option of adding the watch to their cart. The shopping cart is only available if the customer has signed up and entered their login information. On the shopping cart page, the customer can delete items or checkout. If they checkout, they will be prompted to enter their shipping information. Once they confirm, a payment box will appear where credit card information can be entered. Afterwards the customer receives a confirmation thank you.

##Technologies

  * HTML
  * CSS
  * Angular
  * Python
  * Flask
  * PostgresSQL
  * Stripe API

  **Other:**  
  * Amazon Web Services EC2
  * Apache

##Screenshots

The website uses RESTful API's (user makes HTTP requests to GET, POST, Delete data) to coordinate
between the front end (Angular) and the backend (Python/Flask) where the representations are in the form of JSON.





![Alt text](pics/frontend1.png)

The frontpageController handles all the actions of of the initial products page.  The yachtFactory.prods function (named yachtFactory because I was initially going to sell yachts instead of watches but I never changed the name) makes an HTTP GET request to the server and returns data (all of the products) on .success.


the productDetailsController has grabs the specific product ID from the populated list of products when a watch is clicked on and returns the first in the array of data (which is the product title, description and price).


![Alt text](pics/frontend0.png)

Here you can see all of the different HTTP requests made to the server that are called in the controllers.


![Alt text](pics/backend1.png)

The first python function products query all of the products which return data for the frontpageController and the second python function product querys all of the information for the specific product ID. Both return data in JSON format back the the front end.


![Alt text](pics/frontend2.png)

The shoppingCartController includes two factory functions. One to render all of the products in the shopping cart and one to delete items from the shopping cart. Inside the yachtFactory.Cart function a loop is used to go through all of the product prices and add them up for a sum total.  Using a checkout scope as a function, if the sum of the cart is greater than 0 the user will be able to go to the checkout page.


![Alt text](pics/backend2.png)


Every time the user makes a request that gets routed to the server, the users authentication token must be verified. This was created in the login route. After the user is authenticated the shopping cart id is grabbed to be deleted in the delete route. In the shopping cart route the customer is found through the authentication token and the product id is grabbed from the client side post. Using these two id's the customer's products can be entered in their cart.
