import { Component, EventEmitter, Input, Output, forwardRef, OnChanges, SimpleChanges, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { IDropDownOption, DropDownOptionType, DropDownTypes } from "./dropdown-models";
import { ValidatableComponent } from './../validation/validatable.component';
import template from './dropdown.component.html';

@Component({
    selector: 'sdc-dropdown',
    template: template
})
export class DropDownComponent extends ValidatableComponent implements OnChanges, OnInit {

    @Output('changed') changeEmitter:EventEmitter<IDropDownOption> = new EventEmitter<IDropDownOption>();
    @Input() label: string;
    @Input() options: IDropDownOption[];
    @Input() disabled: boolean;
    @Input() placeHolder: string;
    @Input() required: boolean;
    @Input() validate: boolean;
    @Input() headless = false; // Show or hie drop-down header flag
    @Input() maxHeight: number;
    @Input() selectedOption: IDropDownOption;
    @Input() type: DropDownTypes = DropDownTypes.Regular;
    @ViewChild('dropDownWrapper') dropDownWrapper: ElementRef;
    @ViewChild('optionsContainerElement') optionsContainerElement: ElementRef;
    @HostListener('document:click', ['$event']) onClick(e) {
        this.onClickOutside(e);
    }

    // Drop-down show/hide flag. default is false (closed)
    public show = false;
    public active_header:boolean = false;
    // Export DropDownOptionType enum so we can use it on the template
    public cIDropDownOptionType = DropDownOptionType;
    public cIDropDownTypes = DropDownTypes;

    // Configure unselectable option types
    private unselectableOptions = [
        DropDownOptionType.Disable,
        DropDownOptionType.Header,
        DropDownOptionType.HorizontalLine
    ];

    // Set or unset Group style on drop-down
    public isGroupDesign = false;
    public animation_init = false;
    public allOptions :  IDropDownOption[];
    public filterValue:string = '';

    constructor() {
        super();
        this.maxHeight = 244;
    }

    ngOnInit(): void {
        if (this.options) {
            this.allOptions = this.options;
            if (this.options.find(option => option.type === DropDownOptionType.Header)) {
                this.isGroupDesign = true;
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedOption && this.options.indexOf(this.selectedOption) > -1) {
            this.selectedOption = this.isSelectable(this.selectedOption) && this.selectedOption || null;
        }
    }

    public getValue(): any {
        return this.selectedOption && this.selectedOption.value;
    }

    private isSelectable(option: IDropDownOption) {
        return !(!!this.unselectableOptions.find(optionType => optionType === option.type));
    }

    /**
     * Set option as selected and saves it's index on the list
     * @param index - number
     * @param option - IDropDownItem or string
     */
    public selectOption(index: number, option: IDropDownOption): void {
        if(this.type == DropDownTypes.Auto) this.filterValue = option.value;
        if (!this.isSelectable(option)) {
            return;
        }
        this.updateSelected(index);
    }

    /**
     * Update the value, label and index of the drop down with new ones
     */
    private updateSelected(index: number): void {
        const option = this.options[index];
        if (option) {
            this.selectedOption = option;
            this.show = false;
            this.active_header = false;
            this.changeEmitter.next(option.value);
            this.valueChanged(option.value);
        }
    }

    /**
     * Get the label of the selected option
     */
    public bottomVisible = true;

    public isBottomVisible() {
        const windowPos = window.innerHeight + window.pageYOffset;
        const boundingRect = this.dropDownWrapper.nativeElement.getBoundingClientRect();
        const dropDownPos = boundingRect.top + boundingRect.height + this.maxHeight;
        return windowPos > dropDownPos;
    }

    /**
     * Toggle show/hide drop-down list
     */
    public toggleDropdown() {
        if (this.disabled) return;
        this.animation_init = true;
        this.bottomVisible = this.isBottomVisible();
            this.show = !this.show;
            this.show ? this.activateHeader(): this.active_header = false;
    }

    /**
     * When users clicks outside the drop-down it will be closed
     */
    public onClickOutside(event) {
        if (!this.dropDownWrapper.nativeElement.contains(event.target) && !event.target.classList.contains('js-sdc-dropdown--toggle-hook')) {
            this.active_header = false;
            if(this.show)this.show = false;
        }
    }


    public activateHeader(){
        this.active_header = true;
    }


    public filterOptions(filterValue){
        if (filterValue.length >= 1 && !this.show) this.toggleDropdown();
        if (this.selectedOption) this.selectedOption = null;
        this.options = this.allOptions.filter((option)=>{
            return option.value.toLowerCase().indexOf(filterValue.toLowerCase()) > -1;
        })
    }
}
