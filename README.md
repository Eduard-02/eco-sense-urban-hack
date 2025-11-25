# EcoSense
### Making carbon footprints easier to understand by comparing them to your groceries.
</div>

---

## The Concept

It is hard to visualize carbon dioxide. If you hear that your commute releases **5kg of CO₂**, it is difficult to know if that is a lot or a little.

But everyone understands groceries. We know how heavy a liter of milk feels, and we know how much a bag of coffee costs.

**EcoSense** translates your daily habits (like heating your home or driving to work) into grocery items. Instead of abstract numbers, it helps you understand the "cost" of your lifestyle by comparing it to the food in your fridge.

## How it works

### 1. Import a baseline
The app starts by simulating a grocery receipt import. It loads a list of common items (Milk, Rye Bread, Coffee, etc.) with their real carbon footprint values. This creates a "currency" that the app uses to measure everything else.

### 2. Kitchen Analysis
This tab breaks down the carbon impact of the food itself. You can see a clear visual comparison of how different items contribute to your total footprint—for example, seeing how much higher the impact of coffee is compared to local root vegetables.

### 3. Home Energy
The app calculates the daily energy needed to heat your home based on its size and heating type (like District Heating vs. Oil).

Instead of just showing a graph, the app finds a matching item from your grocery list. If your daily energy use is high, it might visualize it as a stack of 5 bags of coffee. If it is efficient, it might just be a carton of milk.

### 4. Trip Calculator
This section compares your commute options:
*   **If you drive:** It shows you how much of your grocery basket you are "consuming" just to get to work.
*   **If you take the bus or train:** It calculates the emissions you avoided and "spends" them on your grocery list. For example: *"By taking the bus, you saved enough CO₂ to cover 100% of the milk and yogurt in your fridge."*

### 5. The Daily Receipt
Finally, the app generates a consolidated receipt. It sums up your housing, transport, and food emissions into one daily total, giving you a complete picture of your footprint for the day.

---

## Tech Stack

*   **React**
*   **TypeScript**
*   **Vite**
*   **CSS**

---

## How to run it

You need Node.js installed on your computer.

1.  **Install the dependencies:**
    ```bash
    npm install
    ```

2.  **Start the app:**
    ```bash
    npm run dev
    ```

3.  **Open in browser:**</br>
    Visit `http://localhost:5173` (or the port shown in your terminal).

---

## Credits

**Contributors:**
*   Martti Ahern
*   Haritha Mohanan
*   Eduardo Cebola

*Made at the Urban Circular Hack Helsinki 2025*
