from flask import Flask, jsonify, request, render_template, session, flash, redirect
import pg
import bcrypt
import uuid

app = Flask('ECommerce')
db = pg.DB(dbname='e-commerce')

@app.route('/api/products')
def products():
    products = db.query('select * from product').dictresult()
    return jsonify(products)

@app.route('/api/product/<productId>')
def eyeDee(productId):
    eyeDee = db.query('select * from product where id = $1', productId).dictresult()
    return jsonify(eyeDee)

@app.route('/api/customer/signup', methods=['POST'])
def signUp():
    custEntry = request.get_json()[0]
    print custEntry
    password = custEntry['password']
    salt = bcrypt.gensalt()
    encrypted_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    result = db.insert('customer', username=custEntry['username'], email=custEntry['email'], password=encrypted_password, first_name=custEntry['first_name'], last_name=custEntry['last_name'])
    return jsonify(result)

@app.route('/api/user/login', methods=['POST'])
def login():
    custEntry = request.get_json()[0]
    password = custEntry['password']
    customer = db.query('select * from customer where username = $1', custEntry["username"]).dictresult()[0]
    encrypted_password = customer['password']
    rehash = bcrypt.hashpw(password.encode('utf-8'), encrypted_password)
    # if we get the same result, that means the password was correct
    if rehash == encrypted_password:
        token = uuid.uuid4()
        loggedin = {"user": {'username': customer['username'], 'email': customer['email'], 'first_name': customer['first_name'], 'last_name': customer['last_name']}, 'authtoken': token}
        print 'Login success!'
        db.insert('auth_token', token=token, customer_id=customer['id'])
        return jsonify(loggedin)

    else:
        print 'Login failed!'
        return 'login failed', 401

@app.route('/api/shopping_cart', methods=['POST'])
def shopping_cart():
    auth_token = request.get_json().get('auth_token')
    check_token = db.query('select * from auth_token where token = $1', auth_token).namedresult()
    if len(check_token) > 0:
        customer = db.query('select customer_id from auth_token where token = $1', auth_token).namedresult()[0]
        prod_id = request.get_json().get('product_id')
        db.insert('product_in_shopping_cart', product_id=prod_id, customer_id=customer.customer_id)
        return 'Add to Cart Success', 200
    else:
        return 'Add to Cart Fail', 403

@app.route('/api/shopping_cart', methods=['GET'])
def get_shop():
    auth_token = request.args.get('auth_token')
    print auth_token
    check_token = db.query('select * from auth_token where token = $1', auth_token).namedresult()
    if len(check_token) > 0:
        customer = db.query('select customer_id from auth_token where token = $1', auth_token).namedresult()[0]
        results = db.query('select product.name as prodName, product.price as prodPrice, product.description as prodDescription, product.image_path as prodImg from product_in_shopping_cart, product where product_in_shopping_cart.product_id = product.id and customer_id =$1', customer.customer_id).dictresult()
        print results
        return jsonify(results)
    else:
        return 'fail', 403

@app.route('/api/shopping_cart/checkout', methods=['POST'])
def checkout():
    auth_token = request.args.get('auth_token')
    # print auth_token
    check_token = db.query('select * from auth_token where token = $1', auth_token).namedresult()
    if len(check_token) > 0:
        customer = db.query('select customer_id from auth_token where token = $1', auth_token).namedresult()[0]
        chat = db.query('select product.id as prod_id, product.name as prodName, product.price as prodPrice, product.description as prodDescription, product.image_path as prodImg from product_in_shopping_cart, product where product_in_shopping_cart.product_id = product.id and customer_id =$1', customer.customer_id).dictresult()
        total = db.query('select sum(product.price) as total from product_in_shopping_cart, product where product_in_shopping_cart.product_id = product.id and customer_id =$1', customer.customer_id).namedresult()[0]
        # print chat
        db.insert('purchase', customer_id=customer.customer_id, total_price=total.total)


        purchase_id = db.query('select id from purchase order by id desc limit 1').namedresult()[0].id

        for product in chat:
            print product
            db.insert('product_in_purchase', purchase_id=purchase_id, product_id=product['prod_id'])

        result = db.query('delete from product_in_shopping_cart where customer_id= $1', customer.customer_id)

        return result, 200
    else:
        return 'fail', 403


if __name__ == '__main__':
    app.run(debug=True)
