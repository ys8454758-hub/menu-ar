import { Dish } from "./restaurant";

export interface CartItem {
    dish: Dish;
    quantity: number;
}

export interface MenuTheme {
    id: string;
    themeName: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
}
