async function checkStatus(msisdn, url, error_link, offercode) {
  const link = `${url}/public/v2/subscriber/exists?msisdn=${msisdn}&services=${offercode}`;

  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  try {
    const response = await fetch(link, requestOptions);
    if (!response.ok) {
      window.location.href = error_link;
    }
  } catch (error) {
    console.error("Error:", error.message);
    window.location.href = error_link;
  }
}
async function fetchData(
  channel,
  offercode,
  errorLink,
  target,
  clickid,
  main_url
) {
  try {
    const msisdn = await getMaskedMsisdn(main_url);
    console.log("msisdn", msisdn);

    if (!msisdn || msisdn === "") {
      throw new Error("Msisdn not found in response.");
    }
    const link = `${main_url}/public/v2/direct/activation?msisdn=${msisdn}&offercode=${offercode}&channel=${channel}&clickid=${clickid}&target=${target}`;
    await SubscribeCustomer(link, errorLink);
  } catch (error) {
    console.error("Error:", error);
    window.location.href = errorLink;
  }
}

async function SubscribeCustomer(link, errorLink) {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  console.log(link);
  try {
    const response = await fetch(link, requestOptions);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const responseData = await response.json();
    console.log(responseData);
    if (responseData && responseData.link) {
      window.location.href = responseData.link;
    } else {
      throw new Error("No link found in the response.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    window.location.href = errorLink;
  }
}

// Function to fetch the token
async function getHeToken(main_url) {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${main_url}/public/v2/hetoken`,
      requestOptions
    );
    console.log(response);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const result = await response.json();
    return result.token;
  } catch (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }
}

// Function to fetch the masked MSISDN using the token
async function getMaskedMsisdn(main_url) {
  let token = await getHeToken(main_url);
  console.log("token", token);
  const headers = {
    Authorization: `Bearer ${token}`,
    "Accept-Encoding": "application/json",
    "Accept-Language": "EN",
    "Content-Type": "application/json",
    "X-Source-System": "he-partner",
  };

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };
  try {
    const response = await fetch(
      "https://identity.safaricom.com/partner/api/v2/fetchMaskedMsisdn",
      requestOptions
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const result = await response.json();
    return result.ServiceResponse.ResponseBody.Response.Msisdn;
  } catch (error) {
    throw new Error(`Fetch failed: ${error}`);
  }
}
