# Title: Sparrow Submarine Shenanigans

## Introduction:
Jack Sparrow's Submarine Control Room is a web application that allows submarines to register and provides real-time updates on their status. The application leverages the power of React, PubNub to create a seamless and interactive experience for managing submarines.

## Design:
The application follows a modern and user-friendly design. The user interface is clean and intuitive, providing a seamless experience for managing submarines. Key design elements include:

**Navigation**: The top navigation bar provides easy access to different sections of the application, such as the Control Room and Submarine Registration.

**Control Room**: The Control Room section displays the active submarines and their status. Each submarine is listed with its name and status, along with a button to hide it. Hidden submarines are shown in a separate section. The Control Room receives real-time updates and dynamically reflects the changes.

**Submarine Registration**: The Submarine Registration section allows submarines to register by providing their ship name. Proper validation ensures that unique ship names are used. Upon successful registration, the Control Room is updated, and the newly added submarine's details are displayed. All this communication is done via *submarine-registration-channel*

**Real-time Updates(submarine status)**: The application uses PubNub to facilitate real-time updates. Whenever a submarine registers or hides, PubNub sends notifications to the Control Room, triggering immediate updates in the interface. Also whenever Jacksparrow sends a threat request from control room, status is updated on the submarine details page. All this communication happens via *sparrow-channel*. 

## Installation:

1. Clone the repo
2. npm install
3. npm start
4. open http://localhost:3000 

