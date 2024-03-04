import time
import logging
import os
# from selenium.webdriver.support.wait import WebDriverWait
# import selenium.webdriver.support.expected_conditions as EC
# from selenium.common.exceptions import TimeoutException
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.common.by import By

import undetected_chromedriver as uc
from pathlib import Path


if __name__ == "__main__":
    driver = uc.Chrome(headless=True,use_subprocess=False)
    driver.get('https://www.youtube.com/@HoushouMarine/streams')
    # print(driver.find_element("metadata").text)
    # driver.save_screenshot('nowsecure.png')