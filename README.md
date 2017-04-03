# Money Buckets

1. Fork/Clone
1. Install dependencies - `npm install`
1. Create a local Postgres databases - `todos` - and then update *server/config.json*
1. Add a "migrations" folder to the "server" folder
1. Create two new migrations:

  ```sh
  $ node_modules/.bin/sequelize model:create --name Todo --attributes "title:string, complete:boolean,UserId:integer"
  $ node_modules/.bin/sequelize model:create --name User --attributes "email:string"
  ```

1. Update the migration files in "server/models" (if necessary) and then sync the database:

  ```sh
  $ node_modules/.bin/sequelize db:migrate
  ```

1. Run the development server - `gulp`


My notes:
git push heroku master -f


cloned from:
Check out the [blog post](http://mherman.org/blog/2015/10/22/node-postgres-sequelize).
