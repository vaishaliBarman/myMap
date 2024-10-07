### Global Map Explorer - Project Summary

**Global Map Explorer** is an interactive web application built using **Mapbox GL JS** that enables users to explore locations on a global map and calculate distances between two places. The app offers a variety of features designed to enhance the user experience when navigating and interacting with geographic data. Key functionalities include:

1. **Interactive Map Interface**: Users can explore a world map with navigation controls (zoom in/out, rotate) and fly to specific locations by searching for places.
   
2. **Location Search with Autocomplete**: The app provides a search bar with an autocomplete feature, allowing users to type the name of a location, view suggestions, and select one to zoom into the map at that location. The user can then drop a marker to set it as the starting location.

3. **Distance Calculation Between Two Places**: 
   - The app offers a second search bar that allows users to search and select another location to calculate the distance between the two points.
   - Users can also set the second point manually by selecting a location on the map.
   - The app calculates the distance between the selected start and end points using the **Mapbox Directions API**.
   
4. **Choose Transportation Mode**: Users can select from different transportation modes – **driving**, **cycling**, or **walking** – to calculate the distance based on the mode of transport.
   
5. **Use My Location Feature**: Users can set their current GPS location as either the start or end point using their device's geolocation services.

6. **Route Visualization**: The calculated route between the two points is displayed on the map with a visible line, offering clear guidance for navigation.

7. **Distance Display**: The calculated distance between the two locations is shown in kilometers, with dynamic updates based on the selected transportation mode.

### Technologies Used:
- **Mapbox GL JS** for rendering the interactive map.
- **Mapbox Directions API** for route and distance calculations.
- **JavaScript** for dynamic behavior, such as handling user interactions and fetching data.
- **HTML/CSS** for structuring and styling the app's user interface.

This project is an efficient tool for map exploration and distance calculation, ideal for travel planning, learning, or general curiosity about global locations.