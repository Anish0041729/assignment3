import java.util.ArrayList;
import java.util.Scanner;

class Book {
    private String id;
    private String title;
    private String author;
    private String category;
    private boolean issued;

    Book(String id, String title, String author, String category) {
        this.id = id.toUpperCase();
        this.title = title;
        this.author = author;
        this.category = category;
        this.issued = false;
    }

    String getId() {
        return id;
    }

    boolean isIssued() {
        return issued;
    }

    void toggleStatus() {
        issued = !issued;
    }

    void display() {
        String status = issued ? "Issued" : "Available";
        System.out.println(id + " | " + title + " | " + author + " | " + category + " | " + status);
    }
}

class LibraryService {
    private ArrayList<Book> books = new ArrayList<>();

    void addBook(Book book) {
        books.add(book);
    }

    Book findBook(String id) {
        for (Book book : books) {
            if (book.getId().equalsIgnoreCase(id)) {
                return book;
            }
        }
        return null;
    }

    void issueOrReturnBook(String id) {
        Book book = findBook(id);
        if (book == null) {
            System.out.println("Book not found.");
            return;
        }
        book.toggleStatus();
        System.out.println("Book status updated.");
    }

    void displayBooks() {
        for (Book book : books) {
            book.display();
        }
    }
}

public class LibraryManagement {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        LibraryService library = new LibraryService();
        library.addBook(new Book("CS101", "Data Structures in Java", "Mark Allen Weiss", "Computer Science"));

        while (true) {
            System.out.println("1. Add book");
            System.out.println("2. Issue or return book");
            System.out.println("3. Display books");
            System.out.println("4. Exit");
            int choice = scanner.nextInt();
            scanner.nextLine();

            if (choice == 1) {
                System.out.print("ID: ");
                String id = scanner.nextLine();
                System.out.print("Title: ");
                String title = scanner.nextLine();
                System.out.print("Author: ");
                String author = scanner.nextLine();
                System.out.print("Category: ");
                String category = scanner.nextLine();
                library.addBook(new Book(id, title, author, category));
            } else if (choice == 2) {
                System.out.print("Book ID: ");
                library.issueOrReturnBook(scanner.nextLine());
            } else if (choice == 3) {
                library.displayBooks();
            } else if (choice == 4) {
                break;
            }
        }

        scanner.close();
    }
}
