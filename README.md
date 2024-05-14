# Uptime: Daily Task Accountability

## Minimum Viable Product - Client-Side Application

**Set daily goals for you and your family and track your progress towards them.**

### Features:
- Create a user without requiring a login
- Create Tasks
- Save Tasks
- Set Goals and associate tasks
- Track your daily progress over time with progress bars and data that track total time and total accomplished days
- Collect points based on time spent on tasks
- Set limits for tasks you do excessively, such as social media usage

### Overview Pictures:
![Overview of Uptime](https://github.com/Brock-Denton/uptime/blob/main/uptime_overview.jpg)

### Introduction:
I've tried many daily trackers, and while they're impressive, they only offered some of what I wanted. I aimed to create a solution focused on family accountability without a login. I wanted to see progress daily for motivation, collect points for positive tasks (and lose points for negative ones), control my data, and curb the ability to cheat by removing easy editing and checkmarks. Additionally, I preferred manually resetting the daily task list instead of having it reset automatically at a specific time every day.

### How to Use It:
1. Download the Uptime folder.
2. Set up a Supabase or equivalent database.
3. Enter your credentials in the `script.js`:
    ```javascript
    const supabaseUrl = '';
    const supabaseAnonKey = '';
    ```
4. Publish to a domain or access via your local environment.

### Roadmap:
- **Current Status:** The app meets the minimum requirements for daily use.
- **Future Plans:**
  - Goal List: Repopulate goals, track goal points, and set up a progress bar for goals.
  - Server-Side Integration: Incorporate a server and API for access without credentials via the script.
  - Publish as an iOS app with more dynamic CSS.
  - Trim code and improve its organization. 

### MIT License:
Feel free to fork, build on, or repurpose this project.
