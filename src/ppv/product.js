// The product on the prototype's product page, and what the page needs from
// the cart. A kettle: it sits in Small Appliances, which the Mega Diwali
// scheme counts, and it is a Gold-exclusive listing, which the Gold scheme
// counts, so the page carries two target schemes.
//
// The photos are free-licence stock (Pexels, photos 10965752 and 10965749,
// "Sleek glass electric kettle" by the same photographer), cropped to the
// kettle; assets/products/. The Pexels licence asks for no attribution.
export const PRODUCT = {
  brand: 'Pigeon',
  title: 'Pigeon Amaze Plus Glass Electric Kettle 1.8 L, Cordless',
  variantLabel: '1.8 L',
  rating: 4.2,
  moreVarieties: 2,
  images: [require('../../assets/products/kettle-glass-1.jpg'), require('../../assets/products/kettle-glass-2.jpg')],
  // The variant chip strip: label (caps) over the value.
  variants: [
    { label: 'PACK', value: '1 Pc', selected: true },
    { label: 'PACK', value: '6 Pcs' },
    { label: 'PACK', value: '12 Pcs' },
  ],
  mrp: 1499,
  price: 1180,
  marginPct: 21.3,
  uom: 'Pc',
  delivery: { priceUom: 'Free delivery', timeUom: 'Delivery in 2 days (18 Sep, Friday)' },
  credit: { heading: 'CREDIT', title: '7 days of free credit', description: 'Pay by 25 Sep with no interest on this order.' },
  seller: 'Pigeon Appliances Distributors',
  // The offer chips the page shows besides the target scheme.
  offers: [{ id: 'jc', title: 'JUMBOCASH', logo: require('../../assets/remote/jumbocash_offer_small.png') }],
  // The target schemes this product counts toward, by scheme id.
  appliesTo: ['diwali', 'gold'],
  // Frequently bought together: the one UI node under the static block.
  related: [
    { title: 'NutriPro Juicer Mixer Grinder 500 W', price: 1890, image: require('../../assets/gifts/mixer.jpg') },
    { title: 'Godrej 20 L Solo Microwave Oven', price: 5490, image: require('../../assets/gifts/microwave.jpg') },
    { title: 'Pigeon Healthifry Air Fryer 4.2 L', price: 3299, image: require('../../assets/gifts/airfryer.jpg') },
  ],
};

// The cart the shop already has when the page opens: three lines, so the
// toolbar badge and the sticky cart bar are on from the first frame.
export const CART = { items: 3, amount: 1246.5, deliveryCharge: 20 };
