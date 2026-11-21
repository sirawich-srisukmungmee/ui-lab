// Adapted Java/JUnit translation of the Selenium IDE QP-01 customer flow.
// The editable Selenium IDE project and its runnable test are ui-lab.side.
import static org.junit.Assert.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

public class QP01customerTest {
  private WebDriver driver;
  private WebDriverWait wait;

  @Before
  public void setUp() {
    String driverPath = System.getenv("CHROMEDRIVER");
    if (driverPath == null || driverPath.isBlank()) {
      throw new IllegalStateException("Set CHROMEDRIVER to the matching local driver path.");
    }
    System.setProperty("webdriver.chrome.driver", driverPath);
    driver = new ChromeDriver();
    wait = new WebDriverWait(driver, Duration.ofSeconds(10));
  }

  @Test
  public void customPizzaKeepsRestrictionsAndPromptsForLoginToRate() {
    String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
    String pizzaName = "Lab Pizza " + stamp;

    driver.get("https://quickpizza.grafana.com/");
    assertEquals("Looking to break out of your pizza routine?", wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.cssSelector("h1"))).getText());
    driver.findElement(By.xpath("//label[normalize-space()='Advanced']")).click();
    WebElement calories = wait.until(ExpectedConditions.visibilityOfElementLocated(
        By.xpath("//label[normalize-space()='Max Calories per Slice']/../input")));
    new Select(wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("select"))))
        .selectByVisibleText("Knife");
    WebElement vegetarian = driver.findElement(By.id("default-checkbox"));
    if (!vegetarian.isSelected()) vegetarian.click();
    WebElement name = driver.findElement(By.id("pizza-name"));
    calories.clear(); calories.sendKeys("600");
    name.clear(); name.sendKeys(pizzaName);
    assertEquals("600", calories.getAttribute("value"));
    assertTrue(vegetarian.isSelected());
    assertEquals(pizzaName, name.getAttribute("value"));

    driver.findElement(By.name("pizza-please")).click();
    String nameLine = wait.until(ExpectedConditions.visibilityOfElementLocated(
        By.xpath("//p[starts-with(.,'Name:')]"))).getText();
    String toolLine = driver.findElement(By.xpath("//p[starts-with(.,'Tool:')]")).getText();
    String calorieLine = driver.findElement(By.xpath("//p[starts-with(.,'Calories per slice:')]")).getText();
    assertEquals("Name: " + pizzaName, nameLine);
    assertFalse(toolLine.contains("Knife"));
    assertTrue(Integer.parseInt(calorieLine.split(":")[1].trim()) <= 600);
    driver.findElement(By.name("rate-5")).click();
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("rate-result")))
        .getText().contains("Please log in first."));

  }

  @After
  public void tearDown() {
    if (driver != null) driver.quit();
  }
}
