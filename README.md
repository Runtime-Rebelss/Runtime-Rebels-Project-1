# Runtime-Rebels-Project-1
Ecommerce website project

## Git Rules:
- Write commitment messages that says what you do, i.e., "Added new code to Product class".
- Do not push any code to the main branch, use separate branches, i.e., use "shopping-cart" or "product", etc.
- Do NOT **force push** your code. This overrides the code on the remote repository with your local code.
- Create your own branches with your changes, then merge when they are confirmed to work.

## Running the Program:
- Create an account on MongoDB, and then send me your username!
### VS Code:
1. Download MongoDB for VS Code extension.
2. Open the extension, press connect and type: `mongodb+srv://<db_username>:<db_password>@runtimerebels.otltnjb.mongodb.net/`, replace `<db_username>` and `<db_password>` with your username and password, then press enter.
3. In [`src\main\resources\application.properties`](https://github.com/Hlocke124/Runtime-Rebels-Project-1/blob/1ac64d05997ec7ab2a09c728ae8098fa193462dc/Runtime-Rebels-Project-1/spring-boot/src/main/resources/application.properties) add `spring.data.mongodb.uri=mongodb+srv://<db_username>:<db_password>@runtimerebels.otltnjb.mongodb.net/`.
4. Connect to the mongoDB by clicking on the extension (it looks like a leaf), then right click on `runtimerebels.otltnjb.mongodb.net`, and press connect.
5. Run `ShoppingCartApplication.java` and in your browser, type http://localhost:8080.
### IntelliJ (Ultimate):
1. Click on the three dots in the top right, then press edit:
   <div align="left">
   <img width="377" height="174" alt="image" src="https://github.com/user-attachments/assets/08b15726-876b-4fe0-bd33-2ef4d1ca88da" />
   </div>
2. Press modify options:
   <div align="left">
   <img width="548" height="143" alt="image" src="https://github.com/user-attachments/assets/01fc23cf-0a99-4043-a550-57e418271ec4" />
   </div>
3. Press environmental variable:
   <div align="left">
   <img width="494" height="107" alt="image" src="https://github.com/user-attachments/assets/3a6967ca-deba-460e-bcfc-988bb72f72e5" />
   </div>
4. A new box will open up called `enviromental variable`, add your connection string here, `mongodb+srv://<db_username>:<db_password>@runtimerebels.otltnjb.mongodb.net/`.
   <div align="left">
   <img width="555" height="77" alt="image" src="https://github.com/user-attachments/assets/45f5b051-2f7c-4970-aecf-e4e607824d5d" />
   </div>
5. Press apply!
6. Run `ShoppingCartApplication.java`.
