var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk")


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

    })
    inventory();
    // selectId();
});




function inventory() {
    query = 'SELECT * FROM products';

    connection.query(query, function(err, data) {
        if (err) throw err;

        console.log('\n' + 'Current Inventory: ');
        console.log('...................\n');

        var strOut = '';
        for (var i = 0; i < data.length; i++) {
            strOut = '';
            strOut += 'Item ID: ' + data[i].item_id + '  //  ';
            strOut += 'Product Name: ' + data[i].product_name + '  //  ';
            strOut += 'Department: ' + data[i].department_name + '  //  ';
            strOut += 'Price: $' + data[i].price + '\n';
            strOut += 'QUANTITY: ' + data[i].stock_quantity + '\n';

            console.log(strOut);
        }

        console.log("---------------------------------------------------------------------\n");

        selectId();
    })
}




function selectId() {
    inquirer
        .prompt([{
            name: "productId",
            type: "input",
            message: chalk.green("What is the ID number of the item you would like to purchase?"),
        }, {
            name: "purchase",
            type: "input",
            message: chalk.green("How many would you like to buy?")
        }])
        .then(function(answer) {

            var id = answer.productId
            var quantity = answer.purchase

            var query = "SELECT * FROM products WHERE ?"

            connection.query(
                query, { item_id: id },
                function(err, data) {
                    for (var i = 0; i < data.length; i++) {
                        console.log(chalk.white("\n Customer has selected: \n      Item ID: " + data[i].item_id + " | Product Name: " + data[i].product_name + " | Price: " + data[i].price + " | Current Qauntity: " + data[i].stock_quantity + '\n'));
                    }

                    if (err) throw err;
                    if (data.length === 0) {
                        console.log(chalk.red('Invalid Item ID. Please select a valid Item ID.'));
                        selectId();

                    } else {
                        var itemData = data[0]

                        if (quantity <= itemData.stock_quantity) {
                            console.log(chalk.cyan('Congratulations, the product you requested is in stock! Placing order!'));


                            var updateQuery = 'UPDATE products SET stock_quantity = ' + (itemData.stock_quantity - quantity) + ' WHERE item_id = ' + id;
                            connection.query(updateQuery, function(err, data) {
                                if (err) throw err;

                                console.log(chalk.cyan('Your order has been placed! Your total is $' + itemData.price * quantity + '\n'));
                                console.log(chalk.redBright(updateQuery + '\n'))
                                console.log(chalk.cyan('Thank you for shopping with us!'));
                                console.log("\n---------------------------------------------------------------------\n");

                                // End the database connection
                                connection.end();
                            })
                        } else {
                            console.log(chalk.red('Sorry, there is not enough of this product in stock to fill your order'));
                            console.log(chalk.red('Please check product quantity and place your order again.'))
                            console.log("\n---------------------------------------------------------------------\n");

                            inventory();

                        }

                    }
                })
        })
}