import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/common/product';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string;
  
  currentKeyWord: string;
  previousKeyWord: string;
  
  searchMode: boolean = false;

  // properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode){
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    } 
  }

  handleSearchProducts(){
    this.currentKeyWord = this.route.snapshot.paramMap.get('keyword');

    if (this.previousKeyWord != this.currentKeyWord){
      this.thePageNumber = 1;
    }

    this.previousKeyWord = this.currentKeyWord;

    console.log(`keyword=${this.currentKeyWord} &&& thePageNumber=${this.thePageNumber}`)

    // now search for the product by the keyword
    this.productService.searchProductsPaginate(this.thePageNumber - 1,
                                               this.thePageSize,
                                               this.currentKeyWord).subscribe(this.processResult());
  }

  handleListProducts(){
    // check if id parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // if could get id paramter, then transfer string to number
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id');

      // get the "name" param string
      this.currentCategoryName = this.route.snapshot.paramMap.get('name');

    } else {
      // not category id, then default to 1
      this.currentCategoryId = 1;
      // get the "name" param string
      this.currentCategoryName = 'Books';
    }

    // check if we have a different category than previous
    // note: angular will reuse a component if it is currently being viewed

    if (this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId} &&& thePageNumber=${this.thePageNumber}`);

    // now get the productList with the given category id
    this.productService.getProductListPaginate(this.thePageNumber - 1,
                                               this.thePageSize,
                                               this.currentCategoryId).subscribe(this.processResult());
  }

  processResult(){
    return data => {
      console.log(data);
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
      // console.log(this.thePageNumber + ' ' + this.thePageSize + ' ' + this.theTotalElements);
    }
  }

  updatePageSize(pageSize: number){
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCart(theProduct: Product){
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    // add to the cart
    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
    
  }
}
